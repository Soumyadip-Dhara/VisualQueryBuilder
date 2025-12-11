using Microsoft.AspNetCore.Mvc;
using QueryBuilderAPI.Models;
using QueryBuilderAPI.Services;

namespace QueryBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetadataController : ControllerBase
    {
        private readonly IDatabaseMetadataService _metadataService;
        private readonly ILogger<MetadataController> _logger;

        public MetadataController(
            IDatabaseMetadataService metadataService,
            ILogger<MetadataController> logger)
        {
            _metadataService = metadataService;
            _logger = logger;
        }

        [HttpGet("schemas")]
        public async Task<ActionResult<List<SchemaInfo>>> GetSchemas()
        {
            try
            {
                var schemas = await _metadataService.GetSchemasAsync();
                return Ok(schemas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving schemas");
                return StatusCode(500, new { message = "Error retrieving schemas", error = ex.Message });
            }
        }

        [HttpGet("tables")]
        public async Task<ActionResult<List<TableInfo>>> GetTables([FromQuery] string? schemaName = null)
        {
            try
            {
                var tables = await _metadataService.GetTablesAsync(schemaName);
                return Ok(tables);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tables");
                return StatusCode(500, new { message = "Error retrieving tables", error = ex.Message });
            }
        }

        [HttpGet("columns")]
        public async Task<ActionResult<List<ColumnInfo>>> GetColumns(
            [FromQuery] string schemaName,
            [FromQuery] string tableName)
        {
            try
            {
                if (string.IsNullOrEmpty(schemaName) || string.IsNullOrEmpty(tableName))
                {
                    return BadRequest(new { message = "Schema name and table name are required" });
                }

                var columns = await _metadataService.GetColumnsAsync(schemaName, tableName);
                return Ok(columns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving columns");
                return StatusCode(500, new { message = "Error retrieving columns", error = ex.Message });
            }
        }

        [HttpGet("foreign-keys")]
        public async Task<ActionResult<List<ForeignKeyInfo>>> GetForeignKeys([FromQuery] string? schemaName = null)
        {
            try
            {
                var foreignKeys = await _metadataService.GetForeignKeysAsync(schemaName);
                return Ok(foreignKeys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving foreign keys");
                return StatusCode(500, new { message = "Error retrieving foreign keys", error = ex.Message });
            }
        }
    }
}
