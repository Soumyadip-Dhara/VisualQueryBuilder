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

            // FROM clause - use the first table
            var firstColumn = request.Columns.First();
            sql.Append($" FROM \"{firstColumn.SchemaName}\".\"{firstColumn.TableName}\"");

            // JOIN clauses
            if (request.Joins != null && request.Joins.Any())
            {
                foreach (var join in request.Joins)
                {
                    sql.Append($" {join.JoinType} JOIN \"{join.RightSchema}\".\"{join.RightTable}\"");
                    sql.Append($" ON \"{join.LeftSchema}\".\"{join.LeftTable}\".\"{join.LeftColumn}\"");
                    sql.Append($" = \"{join.RightSchema}\".\"{join.RightTable}\".\"{join.RightColumn}\"");
                }
            }

            // WHERE clause
            if (request.WhereConditions != null && request.WhereConditions.Any())
            {
                sql.Append(" WHERE ");
                var whereClauses = new List<string>();

                for (int i = 0; i < request.WhereConditions.Count; i++)
                {
                    var condition = request.WhereConditions[i];
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

                sql.Append(string.Join("", whereClauses));
            }

            // ORDER BY clause
            if (!string.IsNullOrEmpty(request.OrderBy))
            {
                sql.Append($" ORDER BY {request.OrderBy}");
                if (!string.IsNullOrEmpty(request.OrderDirection))
                {
                    sql.Append($" {request.OrderDirection}");
                }
            }

            // LIMIT clause
            if (request.Limit.HasValue && request.Limit.Value > 0)
            {
                sql.Append($" LIMIT {request.Limit.Value}");
            }

            return sql.ToString();
        }
    }
}
