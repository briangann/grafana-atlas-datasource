Atlas plugin for Grafana 2.6
===============
[Atlas by Netflix](https://github.com/Netflix/atlas) is backend for managing dimensional time series data.

![Atlas plugin for Grafana](https://cloud.githubusercontent.com/assets/13449387/15770985/2fa6d046-2970-11e6-9c2f-e43937698b63.png)

Plugin presents 2 ways of input an Atlas query: simple query builder UI and raw query input. You can switch input mode by `Switch raw Atlas query input` option in query row menu dropdown.

Query builder supports metrics name, alias, dimensions, aggregations and grouping inputs. In the case of not empty alias and provided grouping, final name will concat alias and grouping value.

Please pay attention to `atlasFormat` property in _plugins.json_ plugin configuration file. Default _json_ Atlas output format allow numeric values like _NaN_ will not get quoted, which can be the cause of problems on Grafana side. Atlas 1.5.0+ supports _std.json_ format.

More info about Atlas data formats [here](https://github.com/Netflix/atlas/wiki/Output-Formats).

TODO: Add dynamic preloading of available metrics and dimensions(tags).
