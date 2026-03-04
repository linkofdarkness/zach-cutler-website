---
slug: sql-server-query-store-psa
title: "PSA: Use SQL Server Query Store Before You Need It"
authors: [zach]
tags: [sql, psa, tips]
description: "Why you should enable SQL Server Query Store now, and how it can save you hours of debugging performance regressions."
keywords: [SQL Server, Query Store, performance tuning, T-SQL, database, PSA]
---

If you're running SQL Server 2016+ and haven't enabled Query Store on your databases, you're leaving one of the best diagnostic tools on the table. Here's why you should turn it on before you have a performance problem.

<!-- truncate -->

## What Is Query Store?

Query Store captures query execution plans and runtime statistics over time. Think of it as a flight recorder for your database's query performance. When a query suddenly starts running slow, Query Store lets you compare the current plan to historical plans and see exactly what changed.

## Why Enable It Now?

The key insight is that Query Store needs **historical data** to be useful. If you enable it after a problem occurs, you won't have baseline data to compare against. Enable it now so that when (not if) you hit a performance regression, you'll have the data you need.

```sql
ALTER DATABASE [YourDatabase]
SET QUERY_STORE = ON (
    OPERATION_MODE = READ_WRITE,
    DATA_FLUSH_INTERVAL_SECONDS = 900,
    INTERVAL_LENGTH_MINUTES = 60,
    MAX_STORAGE_SIZE_MB = 1000,
    QUERY_CAPTURE_MODE = AUTO,
    CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30)
);
```

## Finding Regressed Queries

Once you have data, finding regressions is straightforward:

```sql
SELECT
    qsq.query_id,
    qsqt.query_sql_text,
    rs1.avg_duration AS recent_avg_duration,
    rs2.avg_duration AS historical_avg_duration,
    rs1.avg_duration - rs2.avg_duration AS duration_increase
FROM sys.query_store_query qsq
JOIN sys.query_store_query_text qsqt
    ON qsq.query_text_id = qsqt.query_text_id
JOIN sys.query_store_plan qsp
    ON qsq.query_id = qsp.query_id
JOIN sys.query_store_runtime_stats rs1
    ON qsp.plan_id = rs1.plan_id
JOIN sys.query_store_runtime_stats rs2
    ON qsp.plan_id = rs2.plan_id
WHERE rs1.runtime_stats_interval_id > rs2.runtime_stats_interval_id
    AND rs1.avg_duration > rs2.avg_duration * 2
ORDER BY duration_increase DESC;
```

## Forcing a Known-Good Plan

When a query regresses because the optimizer chose a worse plan, you can force the old plan:

```sql
EXEC sp_query_store_force_plan
    @query_id = 42,
    @plan_id = 7;
```

This buys you time to investigate the root cause without impacting users.

## The Bottom Line

Query Store is free (it's built into SQL Server), lightweight, and invaluable when you need it. Enable it on your databases today. Future-you will thank present-you.
