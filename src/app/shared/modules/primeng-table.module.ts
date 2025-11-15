import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

/**
 * Shared module for PrimeNG Table component
 * This module should be imported in any feature module that needs table functionality
 * Centralizes the table configuration and exports for reusability
 */
@NgModule({
  imports: [CommonModule, TableModule],
  exports: [TableModule]
})
export class PrimeNgTableModule {}
