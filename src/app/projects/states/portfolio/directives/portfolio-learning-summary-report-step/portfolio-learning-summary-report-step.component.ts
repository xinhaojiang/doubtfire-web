import { Component } from '@angular/core';
import { PortfolioContainerComponent } from '../portfolio-container/portfolio-container.component';

@Component({
  selector: 'portfolio-learning-summary-report-step',
  templateUrl: './portfolio-learning-summary-report-step.component.html',
  styleUrls: ['./portfolio-learning-summary-report-step.component.scss']
})
export class PortfolioLearningSummaryReportStepComponent {

  constructor(
    public container: PortfolioContainerComponent,
  ) { }

}