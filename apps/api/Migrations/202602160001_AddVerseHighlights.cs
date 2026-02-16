using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using QuietWord.Api.Data;

#nullable disable

namespace QuietWord.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("202602160001_AddVerseHighlights")]
public partial class AddVerseHighlights : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "verse_highlights",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: false),
                translation = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                verse_ref = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                color = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_verse_highlights", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_verse_highlights_user_id_translation_verse_ref",
            table: "verse_highlights",
            columns: ["user_id", "translation", "verse_ref"],
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_verse_highlights_user_id_updated_at",
            table: "verse_highlights",
            columns: ["user_id", "updated_at"],
            descending: [false, true]);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "verse_highlights");
    }
}

