---
slug: aspnet-core-minimal-apis-tips
title: "5 Things I Wish I Knew Sooner About ASP.NET Core Minimal APIs"
authors: [zach]
tags: [aspnet, dotnet, csharp, tips]
description: "Practical tips for working with ASP.NET Core Minimal APIs — from endpoint filters to validation patterns."
keywords: [ASP.NET Core, Minimal APIs, C#, .NET, web API, tips]
---

Minimal APIs in ASP.NET Core have come a long way since their introduction in .NET 6. After using them in several projects, here are five things I wish I'd known from the start.

<!-- truncate -->

## 1. Endpoint Filters Are Your Friend

If you're coming from controllers, you probably miss action filters. Endpoint filters are the Minimal API equivalent and they're incredibly useful for cross-cutting concerns like validation and logging.

```csharp
app.MapPost("/api/items", async (CreateItemRequest request, IItemService service) =>
{
    var item = await service.CreateAsync(request);
    return Results.Created($"/api/items/{item.Id}", item);
})
.AddEndpointFilter(async (context, next) =>
{
    var request = context.GetArgument<CreateItemRequest>(0);
    if (string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.ValidationProblem(
            new Dictionary<string, string[]>
            {
                ["Name"] = ["Name is required."]
            });
    }
    return await next(context);
});
```

## 2. Route Groups Keep Things Organized

Once you have more than a handful of endpoints, `MapGroup` is essential for keeping your `Program.cs` clean:

```csharp
var items = app.MapGroup("/api/items")
    .RequireAuthorization();

items.MapGet("/", GetAllItems);
items.MapGet("/{id}", GetItemById);
items.MapPost("/", CreateItem);
items.MapPut("/{id}", UpdateItem);
items.MapDelete("/{id}", DeleteItem);
```

## 3. TypedResults Improve OpenAPI Generation

Using `TypedResults` instead of `Results` gives you better OpenAPI/Swagger documentation out of the box:

```csharp
static async Task<Results<Ok<Item>, NotFound>> GetItemById(
    int id,
    IItemService service)
{
    var item = await service.GetByIdAsync(id);
    return item is not null
        ? TypedResults.Ok(item)
        : TypedResults.NotFound();
}
```

## 4. Extension Methods for Endpoint Mapping

Move your endpoint definitions into static extension methods to keep `Program.cs` focused on app configuration:

```csharp
public static class ItemEndpoints
{
    public static IEndpointRouteBuilder MapItemEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/items");
        group.MapGet("/", GetAll);
        group.MapGet("/{id}", GetById);
        return app;
    }

    private static async Task<Ok<List<Item>>> GetAll(IItemService service)
    {
        var items = await service.GetAllAsync();
        return TypedResults.Ok(items);
    }

    private static async Task<Results<Ok<Item>, NotFound>> GetById(
        int id, IItemService service)
    {
        var item = await service.GetByIdAsync(id);
        return item is not null
            ? TypedResults.Ok(item)
            : TypedResults.NotFound();
    }
}
```

Then in `Program.cs` it's just:

```csharp
app.MapItemEndpoints();
```

## 5. Binding from Multiple Sources

Minimal APIs can bind parameters from route values, query strings, headers, and the request body all at once. The `[AsParameters]` attribute is great for grouping related parameters:

```csharp
app.MapGet("/api/items", async ([AsParameters] ItemQuery query, IItemService service) =>
{
    var items = await service.SearchAsync(query);
    return TypedResults.Ok(items);
});

public record ItemQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "Name");
```

These patterns have made my Minimal API projects significantly more maintainable. If you're still organizing everything in `Program.cs`, give endpoint extension methods and route groups a try.
