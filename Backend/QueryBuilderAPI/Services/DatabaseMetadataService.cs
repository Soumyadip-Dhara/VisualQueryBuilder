using Npgsql;
using QueryBuilderAPI.Models;

namespace QueryBuilderAPI.Services
{
    public interface IDatabaseMetadataService
    {
        Task<List<SchemaInfo>> GetSchemasAsync();
        Task<List<TableInfo>> GetTablesAsync(string? schemaName = null);
        Task<List<ColumnInfo>> GetColumnsAsync(string schemaName, string tableName);
        Task<List<ForeignKeyInfo>> GetForeignKeysAsync(string? schemaName = null);
    }

    public class DatabaseMetadataService : IDatabaseMetadataService
    {
        private readonly string _connectionString;

        public DatabaseMetadataService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<List<SchemaInfo>> GetSchemasAsync()
        {
            var schemas = new List<SchemaInfo>();

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
                ORDER BY schema_name";

            using var command = new NpgsqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                schemas.Add(new SchemaInfo
                {
                    SchemaName = reader.GetString(0)
                });
            }

            return schemas;
        }

        public async Task<List<TableInfo>> GetTablesAsync(string? schemaName = null)
        {
            var tables = new List<TableInfo>();

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT table_schema, table_name 
                FROM information_schema.tables 
                WHERE table_type = 'BASE TABLE'
                AND table_schema NOT IN ('pg_catalog', 'information_schema')";

            if (!string.IsNullOrEmpty(schemaName))
            {
                query += " AND table_schema = @schemaName";
            }

            query += " ORDER BY table_schema, table_name";

            using var command = new NpgsqlCommand(query, connection);
            if (!string.IsNullOrEmpty(schemaName))
            {
                command.Parameters.AddWithValue("@schemaName", schemaName);
            }

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                tables.Add(new TableInfo
                {
                    SchemaName = reader.GetString(0),
                    TableName = reader.GetString(1)
                });
            }

            return tables;
        }

        public async Task<List<ColumnInfo>> GetColumnsAsync(string schemaName, string tableName)
        {
            var columns = new List<ColumnInfo>();

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT 
                    c.column_name,
                    c.data_type,
                    c.is_nullable,
                    CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
                    CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key
                FROM information_schema.columns c
                LEFT JOIN (
                    SELECT kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = @schemaName
                    AND tc.table_name = @tableName
                ) pk ON c.column_name = pk.column_name
                LEFT JOIN (
                    SELECT kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_schema = @schemaName
                    AND tc.table_name = @tableName
                ) fk ON c.column_name = fk.column_name
                WHERE c.table_schema = @schemaName
                AND c.table_name = @tableName
                ORDER BY c.ordinal_position";

            using var command = new NpgsqlCommand(query, connection);
            command.Parameters.AddWithValue("@schemaName", schemaName);
            command.Parameters.AddWithValue("@tableName", tableName);

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                columns.Add(new ColumnInfo
                {
                    SchemaName = schemaName,
                    TableName = tableName,
                    ColumnName = reader.GetString(0),
                    DataType = reader.GetString(1),
                    IsNullable = reader.GetString(2).Equals("YES", StringComparison.OrdinalIgnoreCase),
                    IsPrimaryKey = reader.GetBoolean(3),
                    IsForeignKey = reader.GetBoolean(4)
                });
            }

            return columns;
        }

        public async Task<List<ForeignKeyInfo>> GetForeignKeysAsync(string? schemaName = null)
        {
            var foreignKeys = new List<ForeignKeyInfo>();

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT
                    tc.constraint_name,
                    tc.table_schema,
                    tc.table_name,
                    kcu.column_name,
                    ccu.table_schema AS foreign_table_schema,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'";

            if (!string.IsNullOrEmpty(schemaName))
            {
                query += " AND tc.table_schema = @schemaName";
            }

            query += " ORDER BY tc.table_schema, tc.table_name";

            using var command = new NpgsqlCommand(query, connection);
            if (!string.IsNullOrEmpty(schemaName))
            {
                command.Parameters.AddWithValue("@schemaName", schemaName);
            }

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                foreignKeys.Add(new ForeignKeyInfo
                {
                    ConstraintName = reader.GetString(0),
                    SourceSchema = reader.GetString(1),
                    SourceTable = reader.GetString(2),
                    SourceColumn = reader.GetString(3),
                    TargetSchema = reader.GetString(4),
                    TargetTable = reader.GetString(5),
                    TargetColumn = reader.GetString(6)
                });
            }

            return foreignKeys;
        }
    }
}
