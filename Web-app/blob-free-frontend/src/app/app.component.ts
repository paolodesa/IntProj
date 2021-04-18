import { Component, ViewChild } from '@angular/core';
import { DetectionsService } from './services/detections.service';
import { DistViolationsService } from "./services/dist-violations.service";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexYAxis,
  ApexNonAxisChartSeries,
  ApexResponsive
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public pieChartOptions: Partial<PieChartOptions>;

  nmc = {};
  tc = {};
  dvc = {};

  perc_mask: Array<number> = [];

  constructor(private detectionsService: DetectionsService, private distViolationsService: DistViolationsService) {  }

  ngOnInit(): void {
    this.getTimeStamps();
    this.retrieveDetections();
    this.retrieveDistViolations();
    this.chartOptions = {
      series: [
        {
          name: "People detected",
          data: []
        },
        {
          name: "Mask violations",
          data: []
        },
        {
          name: "Distance violations",
          data: []
        },
      ],
      chart: {
        height: 350,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      xaxis: {
        type: "datetime",
        categories: Object.keys(this.tc),
        labels: {
          datetimeUTC: false,
        }
      },
      yaxis: {
        labels: {
          formatter: function(val) {
            return val.toFixed(0);
          }
        }
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      }
    };
    this.pieChartOptions = {
      series: this.perc_mask,
      chart: {
        type: "donut"
      },
      labels: ["Mask", "No mask"],
      responsive: [
        {
          breakpoint: 400,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  getTimeStamps(): void {
    var yesterday = new Date(Date.now())
    yesterday.setHours(yesterday.getHours() + 1 - 23)
    yesterday.setMinutes(0, 0, 0);
    this.nmc[`${yesterday.toISOString().slice(0,-1)}`] = 0;
    this.tc[`${yesterday.toISOString().slice(0,-1)}`] = 0;
    this.dvc[`${yesterday.toISOString().slice(0,-1)}`] = 0;
    for (let index = 0; index < 23; index++) {
      yesterday.setHours(yesterday.getHours() + 1);
      this.nmc[`${yesterday.toISOString().slice(0,-1)}`] = 0;
      this.tc[`${yesterday.toISOString().slice(0,-1)}`] = 0;
      this.dvc[`${yesterday.toISOString().slice(0,-1)}`] = 0;
    }
  }

  retrieveDetections(): void {
    this.detectionsService.getLastDay()
      .subscribe(
        data => {
          console.log(data);
          (data as Array<any>).forEach(element => {
            var date;
            if (element._id.m < 10 && element._id.d < 10) {
              date = `${element._id.y}-0${element._id.m}-0${element._id.d}T${element._id.h}:00:00.000`
            } else if (element._id.d < 10) {
              date = `${element._id.y}-${element._id.m}-0${element._id.d}T${element._id.h}:00:00.000`
            } else if (element._id.m < 10) {
              date = `${element._id.y}-0${element._id.m}-${element._id.d}T${element._id.h}:00:00.000`
            } else {
              date = `${element._id.y}-${element._id.m}-${element._id.d}T${element._id.h}:00:00.000`
            }

            this.nmc[date] = element.no_mask_count
            this.tc[date] = element.tot_count
          });
          
          this.chartOptions.series[0].data = Object.keys(this.tc).map(key => this.tc[key]);
          this.chartOptions.series[1].data = Object.keys(this.nmc).map(key => this.nmc[key]);
        },
        error => {
          console.log(error);
        }
      );
    
    this.detectionsService.getPercMask()
      .subscribe(
        data => {
          console.log(data);
          (data as Array<any>).forEach(element => {
            this.perc_mask.push(element.mask_count);
            this.perc_mask.push(element.no_mask_count);
          });
        },
        error => {
          console.log(error);
        }
      );
  }

  retrieveDistViolations(): void {
    this.distViolationsService.getLastDay()
      .subscribe(
        data => {
          console.log(data);
          (data as Array<any>).forEach(element => {
            var date;
            if (element._id.m < 10 && element._id.d < 10) {
              date = `${element._id.y}-0${element._id.m}-0${element._id.d}T${element._id.h}:00:00.000`
            } else if (element._id.d < 10) {
              date = `${element._id.y}-${element._id.m}-0${element._id.d}T${element._id.h}:00:00.000`
            } else if (element._id.m < 10) {
              date = `${element._id.y}-0${element._id.m}-${element._id.d}T${element._id.h}:00:00.000`
            } else {
              date = `${element._id.y}-${element._id.m}-${element._id.d}T${element._id.h}:00:00.000`
            }

            this.dvc[date] = element.count
          });

          this.chartOptions.series[2].data = Object.keys(this.dvc).map(key => this.dvc[key]);
        },
        error => {
          console.log(error);
        }
      );
  }
}
