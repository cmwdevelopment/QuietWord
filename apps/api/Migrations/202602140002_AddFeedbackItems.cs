using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using QuietWord.Api.Data;

#nullable disable

namespace QuietWord.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202602140002_AddFeedbackItems")]
public partial class AddFeedbackItems : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "feedback_items",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                category = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                rating = table.Column<int>(type: "integer", nullable: false),
                message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                context_path = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_feedback_items", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_feedback_items_user_id_created_at",
            table: "feedback_items",
            columns: new[] { "user_id", "created_at" },
            descending: new[] { false, true });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "feedback_items");
    }
}
