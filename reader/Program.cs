using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using LiteDB;
using STJson = System.Text.Json.JsonSerializer;

var path = args[0];
var collections = new[] { "GameStatisticsData", "GameSessionStatiscticsData" };

using var db = new LiteDatabase($"Filename={path};ReadOnly=true");

var result = new Dictionary<string, object>();

foreach (var name in collections)
{
    var col = db.GetCollection<BsonDocument>(name);
    var docs = col.FindAll().Select(doc => (object)BsonToObject(doc)).ToList();
    result[name] = docs;
}

Console.WriteLine(STJson.Serialize(result));

static object BsonToObject(BsonValue value) => value.Type switch
{
    BsonType.Document => value.AsDocument
        .ToDictionary(k => k.Key, v => BsonToObject(v.Value)),
    BsonType.Array    => value.AsArray
        .Select(item => BsonToObject(item)).ToList(),
    BsonType.Int32    => (object)value.AsInt32,
    BsonType.Int64    => (object)value.AsInt64,
    BsonType.Double   => (object)value.AsDouble,
    BsonType.Boolean  => (object)value.AsBoolean,
    BsonType.DateTime => (object)value.AsDateTime.ToString("O"),
    BsonType.Null     => (object)"null",
    _                 => (object)value.AsString,
};