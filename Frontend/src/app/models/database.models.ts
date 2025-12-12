export interface SchemaInfo {
  schemaName: string;
}

export interface TableInfo {
  schemaName: string;
  tableName: string;
}

export interface ColumnInfo {
  schemaName: string;
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface ForeignKeyInfo {
  constraintName: string;
  sourceSchema: string;
  sourceTable: string;
  sourceColumn: string;
  targetSchema: string;
  targetTable: string;
  targetColumn: string;
}

export interface SelectedColumn {
  schemaName: string;
  tableName: string;
  columnName: string;
  alias?: string;
}

export interface JoinInfo {
  joinType: string; // 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
  leftSchema: string;
  leftTable: string;
  leftColumn: string;
  rightSchema: string;
  rightTable: string;
  rightColumn: string;
}

export interface WhereCondition {
  schemaName: string;
  tableName: string;
  columnName: string;
  operator: string; // '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN'
  value: string;
  logicalOperator?: string; // 'AND' | 'OR'
}

export interface OrderByClause {
  schemaName: string;
  tableName: string;
  columnName: string;
  direction: string; // 'ASC' | 'DESC'
}

export interface GroupByClause {
  schemaName: string;
  tableName: string;
  columnName: string;
}

export interface QueryRequest {
  columns: SelectedColumn[];
  joins: JoinInfo[];
  whereConditions: WhereCondition[];
  orderBy?: OrderByClause[];
  groupBy?: GroupByClause[];
  havingConditions?: WhereCondition[];
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  generatedSql: string;
  data: any[];
  totalRows: number;
}
