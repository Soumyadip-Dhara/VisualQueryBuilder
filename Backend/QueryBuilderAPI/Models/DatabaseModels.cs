namespace QueryBuilderAPI.Models
{
    public class SchemaInfo
    {
        public string SchemaName { get; set; } = string.Empty;
    }

    public class TableInfo
    {
        public string SchemaName { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
    }

    public class ColumnInfo
    {
        public string SchemaName { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string ColumnName { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
        public bool IsNullable { get; set; }
        public bool IsPrimaryKey { get; set; }
        public bool IsForeignKey { get; set; }
    }

    public class ForeignKeyInfo
    {
        public string ConstraintName { get; set; } = string.Empty;
        public string SourceSchema { get; set; } = string.Empty;
        public string SourceTable { get; set; } = string.Empty;
        public string SourceColumn { get; set; } = string.Empty;
        public string TargetSchema { get; set; } = string.Empty;
        public string TargetTable { get; set; } = string.Empty;
        public string TargetColumn { get; set; } = string.Empty;
    }

    public class QueryRequest
    {
        public List<SelectedColumn> Columns { get; set; } = new();
        public List<JoinInfo> Joins { get; set; } = new();
        public List<WhereCondition> WhereConditions { get; set; } = new();
        public string? OrderBy { get; set; }
        public string? OrderDirection { get; set; }
        public int? Limit { get; set; }
    }

    public class SelectedColumn
    {
        public string SchemaName { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string ColumnName { get; set; } = string.Empty;
        public string? Alias { get; set; }
    }

    public class JoinInfo
    {
        public string JoinType { get; set; } = "INNER"; // INNER, LEFT, RIGHT, FULL
        public string LeftSchema { get; set; } = string.Empty;
        public string LeftTable { get; set; } = string.Empty;
        public string LeftColumn { get; set; } = string.Empty;
        public string RightSchema { get; set; } = string.Empty;
        public string RightTable { get; set; } = string.Empty;
        public string RightColumn { get; set; } = string.Empty;
    }

    public class WhereCondition
    {
        public string SchemaName { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string ColumnName { get; set; } = string.Empty;
        public string Operator { get; set; } = "="; // =, !=, >, <, >=, <=, LIKE, IN
        public string Value { get; set; } = string.Empty;
        public string? LogicalOperator { get; set; } // AND, OR
    }

    public class QueryResult
    {
        public string GeneratedSql { get; set; } = string.Empty;
        public List<Dictionary<string, object?>> Data { get; set; } = new();
        public int TotalRows { get; set; }
    }
}
