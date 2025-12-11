import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG imports
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { AccordionModule } from 'primeng/accordion';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MetadataService } from '../../services/metadata.service';
import { QueryService } from '../../services/query.service';
import {
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  ForeignKeyInfo,
  SelectedColumn,
  JoinInfo,
  WhereCondition,
  QueryRequest,
  QueryResult
} from '../../models/database.models';

@Component({
  selector: 'app-query-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    CardModule,
    InputTextModule,
    DialogModule,
    MultiSelectModule,
    AccordionModule,
    ChipModule,
    ToastModule
  ],
  providers: [MetadataService, QueryService, MessageService],
  templateUrl: './query-builder.component.html',
  styleUrl: './query-builder.component.scss'
})
export class QueryBuilderComponent implements OnInit {
  // Metadata
  schemas: SchemaInfo[] = [];
  tables: TableInfo[] = [];
  availableColumns: ColumnInfo[] = [];
  foreignKeys: ForeignKeyInfo[] = [];

  // Selected items
  selectedSchema: string = '';
  selectedTables: TableInfo[] = [];
  selectedColumns: SelectedColumn[] = [];
  joins: JoinInfo[] = [];
  whereConditions: WhereCondition[] = [];

  // UI state
  showJoinDialog = false;
  showWhereDialog = false;
  loading = false;
  
  // Query results
  queryResult: QueryResult | null = null;
  generatedSql = '';

  // Join types
  joinTypes = [
    { label: 'INNER JOIN', value: 'INNER' },
    { label: 'LEFT JOIN', value: 'LEFT' },
    { label: 'RIGHT JOIN', value: 'RIGHT' },
    { label: 'FULL JOIN', value: 'FULL' }
  ];

  // Operators
  operators = [
    { label: '=', value: '=' },
    { label: '!=', value: '!=' },
    { label: '>', value: '>' },
    { label: '<', value: '<' },
    { label: '>=', value: '>=' },
    { label: '<=', value: '<=' },
    { label: 'LIKE', value: 'LIKE' },
    { label: 'IN', value: 'IN' }
  ];

  logicalOperators = [
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' }
  ];

  // New join/where objects
  newJoin: Partial<JoinInfo> = {
    joinType: 'INNER'
  };
  newWhere: Partial<WhereCondition> = {
    operator: '=',
    logicalOperator: 'AND'
  };

  constructor(
    private metadataService: MetadataService,
    private queryService: QueryService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSchemas();
  }

  loadSchemas(): void {
    this.loading = true;
    this.metadataService.getSchemas().subscribe({
      next: (schemas) => {
        this.schemas = schemas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading schemas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load schemas'
        });
        this.loading = false;
      }
    });
  }

  onSchemaChange(): void {
    if (this.selectedSchema) {
      this.loadTables();
      this.loadForeignKeys();
    }
    this.selectedTables = [];
    this.selectedColumns = [];
    this.joins = [];
  }

  loadTables(): void {
    this.loading = true;
    this.metadataService.getTables(this.selectedSchema).subscribe({
      next: (tables) => {
        this.tables = tables.filter(t => t.schemaName === this.selectedSchema);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tables:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tables'
        });
        this.loading = false;
      }
    });
  }

  loadForeignKeys(): void {
    this.metadataService.getForeignKeys(this.selectedSchema).subscribe({
      next: (keys) => {
        this.foreignKeys = keys;
      },
      error: (error) => {
        console.error('Error loading foreign keys:', error);
      }
    });
  }

  onTableSelect(table: TableInfo): void {
    if (!table) return;
    
    this.metadataService.getColumns(table.schemaName, table.tableName).subscribe({
      next: (columns) => {
        columns.forEach(col => {
          const exists = this.availableColumns.some(
            c => c.schemaName === col.schemaName &&
                 c.tableName === col.tableName &&
                 c.columnName === col.columnName
          );
          if (!exists) {
            this.availableColumns.push(col);
          }
        });
      },
      error: (error) => {
        console.error('Error loading columns:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load columns for ' + table.tableName
        });
      }
    });
  }

  onTablesChange(tables: TableInfo[]): void {
    if (!tables || tables.length === 0) return;
    
    // Load columns for the most recently selected table
    const lastTable = tables[tables.length - 1];
    if (lastTable) {
      this.onTableSelect(lastTable);
    }
  }

  addColumn(column: ColumnInfo): void {
    const exists = this.selectedColumns.some(
      c => c.schemaName === column.schemaName &&
           c.tableName === column.tableName &&
           c.columnName === column.columnName
    );

    if (!exists) {
      this.selectedColumns.push({
        schemaName: column.schemaName,
        tableName: column.tableName,
        columnName: column.columnName
      });
    }
  }

  removeColumn(index: number): void {
    this.selectedColumns.splice(index, 1);
  }

  openJoinDialog(): void {
    if (this.selectedTables.length < 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least 2 tables to create a join'
      });
      return;
    }
    this.newJoin = {
      joinType: 'INNER',
      leftSchema: this.selectedSchema,
      rightSchema: this.selectedSchema
    };
    this.showJoinDialog = true;
  }

  addJoin(): void {
    if (this.newJoin.leftTable && this.newJoin.leftColumn &&
        this.newJoin.rightTable && this.newJoin.rightColumn) {
      this.joins.push({
        joinType: this.newJoin.joinType!,
        leftSchema: this.newJoin.leftSchema!,
        leftTable: this.newJoin.leftTable!,
        leftColumn: this.newJoin.leftColumn!,
        rightSchema: this.newJoin.rightSchema!,
        rightTable: this.newJoin.rightTable!,
        rightColumn: this.newJoin.rightColumn!
      });
      this.showJoinDialog = false;
      this.newJoin = { joinType: 'INNER' };
    }
  }

  removeJoin(index: number): void {
    this.joins.splice(index, 1);
  }

  openWhereDialog(): void {
    if (this.selectedColumns.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select columns first'
      });
      return;
    }
    this.newWhere = {
      operator: '=',
      logicalOperator: 'AND'
    };
    this.showWhereDialog = true;
  }

  addWhere(): void {
    if (this.newWhere.schemaName && this.newWhere.tableName &&
        this.newWhere.columnName && this.newWhere.value) {
      this.whereConditions.push({
        schemaName: this.newWhere.schemaName!,
        tableName: this.newWhere.tableName!,
        columnName: this.newWhere.columnName!,
        operator: this.newWhere.operator!,
        value: this.newWhere.value!,
        logicalOperator: this.whereConditions.length > 0 ? this.newWhere.logicalOperator : undefined
      });
      this.showWhereDialog = false;
      this.newWhere = { operator: '=', logicalOperator: 'AND' };
    }
  }

  removeWhere(index: number): void {
    this.whereConditions.splice(index, 1);
  }

  executeQuery(): void {
    if (this.selectedColumns.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one column'
      });
      return;
    }

    const request: QueryRequest = {
      columns: this.selectedColumns,
      joins: this.joins,
      whereConditions: this.whereConditions
    };

    this.loading = true;
    this.queryService.executeQuery(request).subscribe({
      next: (result) => {
        this.queryResult = result;
        this.generatedSql = result.generatedSql;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Query executed successfully. ${result.totalRows} rows returned.`
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error executing query:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to execute query: ' + (error.error?.message || error.message)
        });
        this.loading = false;
      }
    });
  }

  clearQuery(): void {
    this.selectedSchema = '';
    this.selectedTables = [];
    this.selectedColumns = [];
    this.joins = [];
    this.whereConditions = [];
    this.queryResult = null;
    this.generatedSql = '';
    this.availableColumns = [];
  }

  getTableColumns(tableName: string): ColumnInfo[] {
    return this.availableColumns.filter(c => c.tableName === tableName);
  }

  getResultColumns(): string[] {
    if (!this.queryResult || !this.queryResult.data || this.queryResult.data.length === 0) {
      return [];
    }
    return Object.keys(this.queryResult.data[0]);
  }

  onWhereColumnSelect(column: SelectedColumn): void {
    this.newWhere.schemaName = column.schemaName;
    this.newWhere.tableName = column.tableName;
    this.newWhere.columnName = column.columnName;
  }
}

