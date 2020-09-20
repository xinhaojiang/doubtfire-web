import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WebcalService } from 'src/app/api/models/webcal/webcal.service';
import { Webcal } from 'src/app/api/models/webcal/webcal';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'calendar-modal',
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.scss']
})
export class CalendarModalComponent implements OnInit, AfterViewInit {

  constructor(
    private webcalService: WebcalService,
    private constants: DoubtfireConstants,
    private sanitizer: DomSanitizer,
    @Inject(alertService) private alerts: any,
    dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  @ViewChild('webcalToggle') webcalToggle: MatSlideToggle;

  webcal: Webcal | null;
  working: boolean = false;

  // Used to store user interaction with the reminder option. These values aren't bound directly to `this.webcal`
  // because they are resettable.
  newReminderActive: boolean = false;
  newReminderTime: number | null = null;
  newReminderUnit: string | null = null;

  ngOnInit() {
    // Retrieve current webcal.
    this.working = true;
    this.webcalService.get({}).subscribe(
      (webcal) => {
        this.loadWebcal(webcal);
        this.working = false;
      }
    );
  }

  ngAfterViewInit() {
    // Disallow the value of the slide toggle being changed by the user. Instead, its value is bound to the presence of
    // `this.webcal`.
    this.webcalToggle.defaults.disableToggleValue = true;
  }

  /**
   * Retrieves the URL of the webcal relative to current API URL.
   */
  get webcalUrl(): string {
    return this.webcal ? this.webcal.getUrl(this.constants.API_URL).toString() : null;
  }

  /**
   * Invoked when the user toggles the webcal.
   */
  onWebcalToggle() {
    this.working = true;
    this.webcalService.updateWebcal({
      enabled: !this.webcalToggle.checked,
    }).subscribe((webcal) => {
      this.loadWebcal(webcal);
      this.working = false;
    });
  }

  /**
   * Displays a notification that the webcal URL has been copied.
   * `cdkCopyToClipboard` is expected do the actual copying.
   */
  onCopyWebcalUrl() {
    this.alerts.add('success', 'Web calendar URL copied to the clipboard', 2000);
  }

  /**
   * Invoked when the user requests their webcal URL to be changed.
   */
  onChangeWebcalUrl() {
    this.working = true;
    this.webcalService.updateWebcal({
      should_change_guid: true,
    }).subscribe((webcal) => {
      this.loadWebcal(webcal);
      this.working = false;
    })
  }

  /**
   * Invoked when the user toggles the "has reminder" option.
   */
  onToggleReminderActive() {

    // If the option is enabled...
    if (this.newReminderActive) {

      // ...and a reminder doesn't exist already, default it to 1 week, but don't save the value yet.
      if (!this.webcal.reminder) {
        this.newReminderTime = 1;
        this.newReminderUnit = 'W';
      }

    // If the option is disabled...
    } else {

      // ...and a reminder does exist, make backend request to remove it.
      if (this.webcal.reminder) {
        this.working = true;
        this.webcalService.updateWebcal({
          reminder: null,
        }).subscribe((webcal) => {
          this.loadWebcal(webcal);
          this.working = false;
        })

      // ...otherwise, reset.
      } else {
        this.loadWebcal(this.webcal);
      }
    }
  }

  /**
   * Invoked when the user saves the edited reminder time & unit.
   */
  onSaveReminderEdits() {
    if (this.newReminderTime > 0) {
      this.working = true;
      this.webcalService.updateWebcal({
        reminder: {
          time: this.newReminderTime,
          unit: this.newReminderUnit,
        },
      }).subscribe((webcal) => {
        this.loadWebcal(webcal);
        this.working = false;
      })
    } else {
      this.alerts.add('danger', 'Please specify a valid reminder time', 2000);
    }
  }

  /**
   * Invoked when the user cancels their edits to the reminder option, reverting the webcal to its original state.
   */
  onCancelReminderEdits() {
    this.loadWebcal(this.webcal);
  }

  /**
   * Includes task 'Start Dates' in the Webcal.
   */
  toggleIncludeTaskStartDates() {
    this.working = true;
    this.webcalService.updateWebcal({
      include_start_dates: !this.webcal.include_start_dates,
    }).subscribe((webcal) => {
      this.loadWebcal(webcal);
      this.working = false;
    });;
  }

  /**
   * Bypasses sanitization of the specified URL.
   */
  bypass(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  /**
   * Resets the state of this modal according to match the specified webcal.
   */
  private loadWebcal(webcal: Webcal) {
    this.webcal = webcal;
    if (webcal) {
      if (webcal.reminder) {
        this.newReminderActive = true;
        this.newReminderTime = webcal.reminder.time;
        this.newReminderUnit = webcal.reminder.unit;
      } else {
        this.newReminderActive = false;
        this.newReminderTime = this.newReminderUnit = null;
      }
    }
  }
}