import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, TableModule],
  exports: [TableModule]
})
export class PrimeNgTableModule {}
