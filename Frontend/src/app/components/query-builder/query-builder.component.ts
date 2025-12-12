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
import { InputNumberModule } from 'primeng/inputnumber';
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
  OrderByClause,
  GroupByClause,
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
    InputNumberModule,
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
  selectedSchemas: string[] = [];
  selectedTables: TableInfo[] = [];
  selectedColumns: SelectedColumn[] = [];
  joins: JoinInfo[] = [];
  whereConditions: WhereCondition[] = [];
  orderByList: OrderByClause[] = [];
  groupByList: GroupByClause[] = [];
  havingConditions: WhereCondition[] = [];
  limitValue?: number;
  offsetValue?: number;

  // UI state
  showJoinDialog = false;
  showWhereDialog = false;
  showOrderByDialog = false;
  showGroupByDialog = false;
  showHavingDialog = false;
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

  sortDirections = [
    { label: 'Ascending (A-Z)', value: 'ASC' },
    { label: 'Descending (Z-A)', value: 'DESC' }
  ];

  // New join/where/order/group objects
  newJoin: Partial<JoinInfo> = {
    joinType: 'INNER'
  };
  newWhere: Partial<WhereCondition> = {
    operator: '=',
    logicalOperator: 'AND'
  };
  newOrderBy: Partial<OrderByClause> = {
    direction: 'ASC'
  };
  newGroupBy: Partial<GroupByClause> = {};
  newHaving: Partial<WhereCondition> = {
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
          summary: 'Connection Issue',
          detail: 'Unable to connect to the database. Please check if the database server is running.'
        });
        this.loading = false;
      }
    });
  }

  onSchemaChange(): void {
    if (this.selectedSchemas && this.selectedSchemas.length > 0) {
      this.loadTables();
      this.loadForeignKeys();
    }
    this.selectedTables = [];
    this.selectedColumns = [];
    this.joins = [];
  }

  loadTables(): void {
    this.loading = true;
    this.tables = [];
    
    // Load tables from all selected schemas
    const tableRequests = this.selectedSchemas.map(schema => 
      this.metadataService.getTables(schema)
    );
    
    // Wait for all requests to complete
    Promise.all(tableRequests.map(req => req.toPromise()))
      .then(results => {
        results.forEach(tables => {
          if (tables) {
            this.tables.push(...tables.filter(t => 
              this.selectedSchemas.includes(t.schemaName)
            ));
          }
        });
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading tables:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Cannot Load Tables',
          detail: 'Unable to retrieve tables from the selected schemas. Please try again.'
        });
        this.loading = false;
      });
  }

  loadForeignKeys(): void {
    this.foreignKeys = [];
    
    // Load foreign keys from all selected schemas
    const fkRequests = this.selectedSchemas.map(schema => 
      this.metadataService.getForeignKeys(schema)
    );
    
    Promise.all(fkRequests.map(req => req.toPromise()))
      .then(results => {
        results.forEach(keys => {
          if (keys) {
            this.foreignKeys.push(...keys);
          }
        });
      })
      .catch(error => {
        console.error('Error loading foreign keys:', error);
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
        summary: 'Need More Tables',
        detail: 'You need to select at least 2 tables before connecting them together.'
      });
      return;
    }
    this.newJoin = {
      joinType: 'INNER',
      leftSchema: this.selectedSchemas[0],
      rightSchema: this.selectedSchemas[0]
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
        summary: 'Need Columns First',
        detail: 'Please select some columns before adding filters.'
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
      this.whereConditions.push(this.createCondition(
        this.newWhere,
        this.whereConditions.length
      ));
      this.showWhereDialog = false;
      this.newWhere = { operator: '=', logicalOperator: 'AND' };
    }
  }

  removeWhere(index: number): void {
    this.whereConditions.splice(index, 1);
  }

  openOrderByDialog(): void {
    if (this.selectedColumns.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Need Columns First',
        detail: 'Please select some columns before adding sorting.'
      });
      return;
    }
    this.newOrderBy = { direction: 'ASC' };
    this.showOrderByDialog = true;
  }

  addOrderBy(): void {
    if (this.newOrderBy.schemaName && this.newOrderBy.tableName &&
        this.newOrderBy.columnName && this.newOrderBy.direction) {
      this.orderByList.push({
        schemaName: this.newOrderBy.schemaName!,
        tableName: this.newOrderBy.tableName!,
        columnName: this.newOrderBy.columnName!,
        direction: this.newOrderBy.direction!
      });
      this.showOrderByDialog = false;
      this.newOrderBy = { direction: 'ASC' };
    }
  }

  removeOrderBy(index: number): void {
    this.orderByList.splice(index, 1);
  }

  openGroupByDialog(): void {
    if (this.selectedColumns.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Need Columns First',
        detail: 'Please select some columns before adding grouping.'
      });
      return;
    }
    this.newGroupBy = {};
    this.showGroupByDialog = true;
  }

  addGroupBy(): void {
    if (this.newGroupBy.schemaName && this.newGroupBy.tableName &&
        this.newGroupBy.columnName) {
      this.groupByList.push({
        schemaName: this.newGroupBy.schemaName!,
        tableName: this.newGroupBy.tableName!,
        columnName: this.newGroupBy.columnName!
      });
      this.showGroupByDialog = false;
      this.newGroupBy = {};
    }
  }

  removeGroupBy(index: number): void {
    this.groupByList.splice(index, 1);
  }

  openHavingDialog(): void {
    if (this.groupByList.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Need GROUP BY First',
        detail: 'HAVING conditions require GROUP BY. Please add GROUP BY first.'
      });
      return;
    }
    this.newHaving = {
      operator: '=',
      logicalOperator: 'AND'
    };
    this.showHavingDialog = true;
  }

  addHaving(): void {
    if (this.newHaving.schemaName && this.newHaving.tableName &&
        this.newHaving.columnName && this.newHaving.value) {
      this.havingConditions.push(this.createCondition(
        this.newHaving,
        this.havingConditions.length
      ));
      this.showHavingDialog = false;
      this.newHaving = { operator: '=', logicalOperator: 'AND' };
    }
  }

  removeHaving(index: number): void {
    this.havingConditions.splice(index, 1);
  }

  executeQuery(): void {
    if (this.selectedColumns.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Columns Selected',
        detail: 'Please choose at least one column to display in your results.'
      });
      return;
    }

    const request: QueryRequest = {
      columns: this.selectedColumns,
      joins: this.joins,
      whereConditions: this.whereConditions,
      orderBy: this.orderByList.length > 0 ? this.orderByList : undefined,
      groupBy: this.groupByList.length > 0 ? this.groupByList : undefined,
      havingConditions: this.havingConditions.length > 0 ? this.havingConditions : undefined,
      limit: this.limitValue,
      offset: this.offsetValue
    };

    this.loading = true;
    this.queryService.executeQuery(request).subscribe({
      next: (result) => {
        this.queryResult = result;
        this.generatedSql = result.generatedSql;
        this.messageService.add({
          severity: 'success',
          summary: '🎉 Success!',
          detail: `Great! Found ${result.totalRows} matching result${result.totalRows !== 1 ? 's' : ''}.`,
          life: 5000
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error executing query:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Query Failed',
          detail: 'Something went wrong while running your query. Please check your selections and try again.',
          life: 8000
        });
        this.loading = false;
      }
    });
  }

  clearQuery(): void {
    this.selectedSchemas = [];
    this.selectedTables = [];
    this.selectedColumns = [];
    this.joins = [];
    this.whereConditions = [];
    this.orderByList = [];
    this.groupByList = [];
    this.havingConditions = [];
    this.limitValue = undefined;
    this.offsetValue = undefined;
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

  onOrderByColumnSelect(column: SelectedColumn): void {
    this.newOrderBy.schemaName = column.schemaName;
    this.newOrderBy.tableName = column.tableName;
    this.newOrderBy.columnName = column.columnName;
  }

  onGroupByColumnSelect(column: SelectedColumn): void {
    this.newGroupBy.schemaName = column.schemaName;
    this.newGroupBy.tableName = column.tableName;
    this.newGroupBy.columnName = column.columnName;
  }

  onHavingColumnSelect(column: SelectedColumn): void {
    this.newHaving.schemaName = column.schemaName;
    this.newHaving.tableName = column.tableName;
    this.newHaving.columnName = column.columnName;
  }

  // Helper method to create condition objects (used for both WHERE and HAVING)
  private createCondition(source: Partial<WhereCondition>, existingCount: number): WhereCondition {
    return {
      schemaName: source.schemaName!,
      tableName: source.tableName!,
      columnName: source.columnName!,
      operator: source.operator!,
      value: source.value!,
      logicalOperator: existingCount > 0 ? source.logicalOperator : undefined
    };
  }
}

