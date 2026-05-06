using System;
using System.Collections.Generic;
using System.Linq;
using LiteDB;
using Microsoft.Data.Sqlite;

var liteDbPath = args[0];
var sqlitePath = args[1];

using var db = new LiteDatabase($"Filename={liteDbPath};ReadOnly=true");
using var sqlite = new SqliteConnection($"Data Source={sqlitePath}");
sqlite.Open();

var collections = db.GetCollectionNames();

foreach (var name in collections)
{
    var col = db.GetCollection<BsonDocument>(name);
    var docs = col.FindAll().ToList();
    if (!docs.Any()) continue;

    var keys = docs.SelectMany(d => d.Keys).Distinct().Where(k => k != "_id").ToList();

    var createCols = string.Join(", ", keys.Select(k => $"\"{k}\" TEXT"));
    var cmd = sqlite.CreateCommand();
    cmd.CommandText = $"CREATE TABLE IF NOT EXISTS \"{name}\" (\"_id\" TEXT PRIMARY KEY, {createCols})";
    cmd.ExecuteNonQuery();

    foreach (var doc in docs)
    {
        var idValue = doc["_id"].Type switch
        {
            BsonType.Int32    => doc["_id"].AsInt32.ToString(),
            BsonType.Int64    => doc["_id"].AsInt64.ToString(),
            BsonType.ObjectId => doc["_id"].AsObjectId.ToString(),
            _                 => doc["_id"].AsString
        };

        var cols = new List<string> { "\"_id\"" };
        var vals = new List<string> { $"'{idValue}'" };

        foreach (var key in keys)
        {
            cols.Add($"\"{key}\"");
            var val = doc.ContainsKey(key) ? SerializeValue(doc[key]) : "NULL";
            vals.Add(val);
        }

        var insert = sqlite.CreateCommand();
        insert.CommandText = $"INSERT OR REPLACE INTO \"{name}\" ({string.Join(", ", cols)}) VALUES ({string.Join(", ", vals)})";
        insert.ExecuteNonQuery();
    }
}

Console.WriteLine("ok");

static string SerializeValue(BsonValue value) => value.Type switch
{
    BsonType.Null     => "NULL",
    BsonType.Int32    => value.AsInt32.ToString(),
    BsonType.Int64    => value.AsInt64.ToString(),
    BsonType.Double   => value.AsDouble.ToString(),
    BsonType.Boolean  => value.AsBoolean ? "1" : "0",
    BsonType.DateTime => $"'{value.AsDateTime:O}'",
    _                 => $"'{value.ToString()?.Replace("'", "''")}'"
};