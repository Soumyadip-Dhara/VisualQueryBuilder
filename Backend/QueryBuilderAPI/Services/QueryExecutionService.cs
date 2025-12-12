using Npgsql;
using QueryBuilderAPI.Models;
using System.Text;

namespace QueryBuilderAPI.Services
{
    public interface IQueryExecutionService
    {
        Task<QueryResult> ExecuteQueryAsync(QueryRequest request);
    }

    public class QueryExecutionService : IQueryExecutionService
    {
        private readonly string _connectionString;

        public QueryExecutionService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<QueryResult> ExecuteQueryAsync(QueryRequest request)
        {
            if (request.Columns == null || !request.Columns.Any())
            {
                throw new ArgumentException("At least one column must be selected");
            }

            var sql = GenerateSql(request);
            var result = new QueryResult
            {
                GeneratedSql = sql,
                Data = new List<Dictionary<string, object?>>()
            };

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new NpgsqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, object?>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    var value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    row[reader.GetName(i)] = value;
                }
                result.Data.Add(row);
            }

            result.TotalRows = result.Data.Count;

            return result;
        }

        private string GenerateSql(QueryRequest request)
        {
            var sql = new StringBuilder();

            // SELECT clause
            sql.Append("SELECT ");
            var columnSelects = request.Columns.Select(c =>
            {
                var columnRef = $"\"{c.SchemaName}\".\"{c.TableName}\".\"{c.ColumnName}\"";
                return string.IsNullOrEmpty(c.Alias)
                    ? columnRef
                    : $"{columnRef} AS \"{c.Alias}\"";
            });
            sql.Append(string.Join(", ", columnSelects));

            // FROM clause - determine the base table
            string fromTable = DetermineFromTable(request);
            sql.Append($" FROM {fromTable}");

            // JOIN clauses
            if (request.Joins != null && request.Joins.Any())
            {
                foreach (var join in request.Joins)
                {
                    var leftTableRef = $"\"{join.LeftSchema}\".\"{join.LeftTable}\"";
                    var rightTableRef = $"\"{join.RightSchema}\".\"{join.RightTable}\"";
                    
                    // Add the right table with the JOIN
                    sql.Append($" {join.JoinType} JOIN {rightTableRef}");
                    sql.Append($" ON {leftTableRef}.\"{join.LeftColumn}\"");
                    sql.Append($" = {rightTableRef}.\"{join.RightColumn}\"");
                }
            }

            // WHERE clause
            if (request.WhereConditions != null && request.WhereConditions.Any())
            {
                sql.Append(" WHERE ");
                sql.Append(BuildConditions(request.WhereConditions));
            }

            // GROUP BY clause
            if (request.GroupBy != null && request.GroupBy.Any())
            {
                sql.Append(" GROUP BY ");
                var groupByClauses = request.GroupBy.Select(g =>
                    $"\"{g.SchemaName}\".\"{g.TableName}\".\"{g.ColumnName}\"");
                sql.Append(string.Join(", ", groupByClauses));
            }

            // HAVING clause
            if (request.HavingConditions != null && request.HavingConditions.Any())
            {
                sql.Append(" HAVING ");
                sql.Append(BuildConditions(request.HavingConditions));
            }

            // ORDER BY clause
            if (request.OrderBy != null && request.OrderBy.Any())
            {
                sql.Append(" ORDER BY ");
                var orderByClauses = request.OrderBy.Select(o =>
                    $"\"{o.SchemaName}\".\"{o.TableName}\".\"{o.ColumnName}\" {o.Direction}");
                sql.Append(string.Join(", ", orderByClauses));
            }

            // LIMIT clause
            if (request.Limit.HasValue && request.Limit.Value > 0)
            {
                sql.Append($" LIMIT {request.Limit.Value}");
            }

            // OFFSET clause
            if (request.Offset.HasValue && request.Offset.Value >= 0)
            {
                sql.Append($" OFFSET {request.Offset.Value}");
            }

            return sql.ToString();
        }

        private string DetermineFromTable(QueryRequest request)
        {
            // If there are joins, use the left table of the first join as the FROM table
            if (request.Joins != null && request.Joins.Any())
            {
                var firstJoin = request.Joins.First();
                return $"\"{firstJoin.LeftSchema}\".\"{firstJoin.LeftTable}\"";
            }
            
            // Otherwise, use the table from the first column
            var firstColumn = request.Columns.First();
            return $"\"{firstColumn.SchemaName}\".\"{firstColumn.TableName}\"";
        }

        private string BuildConditions(List<WhereCondition> conditions)
        {
            var whereClauses = new List<string>();

            for (int i = 0; i < conditions.Count; i++)
            {
                var condition = conditions[i];
                var clause = new StringBuilder();

                if (i > 0 && !string.IsNullOrEmpty(condition.LogicalOperator))
                {
                    clause.Append($" {condition.LogicalOperator} ");
                }

                clause.Append($"\"{condition.SchemaName}\".\"{condition.TableName}\".\"{condition.ColumnName}\" {condition.Operator} ");

                if (condition.Operator.Equals("IN", StringComparison.OrdinalIgnoreCase))
                {
                    clause.Append($"({condition.Value})");
                }
                else if (condition.Operator.Equals("LIKE", StringComparison.OrdinalIgnoreCase))
                {
                    clause.Append($"'{condition.Value}'");
                }
                else
                {
                    // Try to parse as number, otherwise treat as string
                    if (decimal.TryParse(condition.Value, out _) || 
                        bool.TryParse(condition.Value, out _))
                    {
                        clause.Append(condition.Value);
                    }
                    else
                    {
                        clause.Append($"'{condition.Value.Replace("'", "''")}'");
                    }
                }

                whereClauses.Add(clause.ToString());
            }

            return string.Join("", whereClauses);
        }
    }
}
