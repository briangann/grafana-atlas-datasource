# Atlas plugin for Grafana 4.x

[Atlas by Netflix](https://github.com/Netflix/atlas) is a backend for managing dimensional time series data.

![Grafana](http://grafana.org/assets/img/logo_new_transparent_200x48.png)

![Atlas plugin for Grafana](https://user-images.githubusercontent.com/16865782/35920975-f7e1178c-0c4b-11e8-9c64-ee918f2dbe3f.png)

### About this plugin
This [Grafana](https://grafana.org) plugin for Atlas provides a query builder with aliases, dimensions, aggregations and grouping.

The query builder provides metric hints for tags on the fly, along with their dimensions, allowing you to construct Atlas queries easily.

A "raw" query method is also available via a toggle in the query builder that will accept well-formed Atlas queries.

Based on [Grafana 3.x plugin](https://github.com/briangann/grafana3-atlas-datasource) by Brian Gann.

### Running with Docker
A ``docker-compose.yml`` file is provided to easily stand up a Grafana 4.x server with this datasource mapped to the container.

### Installation

* Copy/clone this repos into /var/lib/grafana/plugins
* Restarting ``grafana-server`` is required to pick up the plugin.

Once the plugin is "feature complete" a PR will be made to add this plugin to the official datasource plugins on [Grafana.net](http://grafana.net)

### Important
You need to run Atlas 1.5.0+ for this to function properly as ``std.json`` output is mandatory.

### Using the plugin

#### Setup datasource

![Add Atlas Datasource](https://user-images.githubusercontent.com/16865782/35921138-6882ae1a-0c4c-11e8-812d-c8208846397d.png)

![Test Atlas Datasource](https://user-images.githubusercontent.com/16865782/35921181-85983fba-0c4c-11e8-9dc4-06f695b9cd07.png)

#### Using query builder

Add a new graph to a dashboard and select the Atlas datasource.

![Example Query builder ](https://user-images.githubusercontent.com/16865782/35921216-a0b9e780-0c4c-11e8-8f89-db2cfc32ffbf.png)

#### Tag hints

Select the textbox for metrics, and hints will be provided:

![Hints](https://user-images.githubusercontent.com/16865782/35921264-cb2ae406-0c4c-11e8-9a9b-7353ac86efbc.png)

Hints for dimensions that apply the selected metric are also provided.

#### Using raw query

Add a new graph to a dashboard and select the Atlas datasource.

![Example Raw Query builder ](https://user-images.githubusercontent.com/16865782/35921370-fdd546b2-0c4c-11e8-95bb-cafcf5a5e4c2.png)

### References

More info about Atlas data formats [here](https://github.com/Netflix/atlas/wiki/Output-Formats).
