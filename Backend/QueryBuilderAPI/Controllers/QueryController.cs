using Microsoft.AspNetCore.Mvc;
using QueryBuilderAPI.Models;
using QueryBuilderAPI.Services;

namespace QueryBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QueryController : ControllerBase
    {
        private readonly IQueryExecutionService _queryService;
        private readonly ILogger<QueryController> _logger;

        public QueryController(
            IQueryExecutionService queryService,
            ILogger<QueryController> logger)
        {
            _queryService = queryService;
            _logger = logger;
        }

        [HttpPost("execute")]
        public async Task<ActionResult<QueryResult>> ExecuteQuery([FromBody] QueryRequest request)
        {
            try
            {
                if (request.Columns == null || !request.Columns.Any())
                {
                    return BadRequest(new { message = "At least one column must be selected" });
                }

                var result = await _queryService.ExecuteQueryAsync(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid query request");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing query");
                return StatusCode(500, new { message = "Error executing query", error = ex.Message });
            }
        }
    }
}
