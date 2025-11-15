import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { PrimeNgTableModule } from '../../../shared/modules/primeng-table.module';
import { UserService } from '../../../core/services/user.service';
import { DashboardStats } from '../models/dashboard.model';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, PrimeNgTableModule, NgxEchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.userService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading.set(false);
      }
    });
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // User Growth Chart (Line Chart)
  userGrowthChartOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      name: 'Users',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ]
        }
      }
    }]
  };

  // User Status Distribution (Pie Chart)
  statusDistributionChartOption: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: '#6b7280' }
    },
    series: [{
      name: 'User Status',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: [
        { value: 74, name: 'Active', itemStyle: { color: '#00b894' } },
        { value: 15, name: 'Inactive', itemStyle: { color: '#6b7280' } },
        { value: 8, name: 'Suspended', itemStyle: { color: '#e74c3c' } }
      ]
    }]
  };

  // Role Distribution (Bar Chart)
  roleDistributionChartOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Admin', 'Manager', 'Editor', 'Viewer', 'Guest'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      name: 'Users',
      type: 'bar',
      data: [15, 28, 45, 67, 32],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#6c5ce7' },
            { offset: 1, color: '#a29bfe' }
          ]
        },
        borderRadius: [8, 8, 0, 0]
      }
    }]
  };
}
