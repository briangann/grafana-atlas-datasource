"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AtlasDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _angular = require("angular");

var _angular2 = _interopRequireDefault(_angular);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _datemath = require("app/core/utils/datemath");

var _datemath2 = _interopRequireDefault(_datemath);

var _kbn = require("app/core/utils/kbn");

var _kbn2 = _interopRequireDefault(_kbn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AtlasDatasource = exports.AtlasDatasource = function () {
    function AtlasDatasource(instanceSettings, $q, backendSrv, templateSrv) {
        _classCallCheck(this, AtlasDatasource);

        this.type = instanceSettings.type;
        this.url = instanceSettings.url;
        this.name = instanceSettings.name;
        this.q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        this.atlasFormat = instanceSettings.atlasFormat || 'std.json';
        this.minimumInterval = instanceSettings.minimumInterval || 1000;
    }

    // Required for templating


    _createClass(AtlasDatasource, [{
        key: "metricFindQuery",
        value: function metricFindQuery(query) {
            return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/tags/' + (query ? this.templateSrv.replaceWithText(query) : 'name'),
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(this.mapToTextValue);
        }
    }, {
        key: "metricFind",
        value: function metricFind(options) {
            return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/tags/name',
                data: options,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(this.mapToTextValue);
        }
    }, {
        key: "mapToTextValue",
        value: function mapToTextValue(result) {
            return _lodash2.default.map(result.data, function (d) {
                return {
                    text: d,
                    value: d
                };
            });
        }
    }, {
        key: "metricFindDimensions",
        value: function metricFindDimensions(options) {
            return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/tags?q=name,' + options.target + ',:eq',
                data: options,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(this.mapToTextValue);
        }
    }, {
        key: "dimensionFindValues",
        value: function dimensionFindValues(options, tag) {
            return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/tags/' + tag,
                data: options,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(this.mapToTextValue);
        }
    }, {
        key: "query",
        value: function query(options) {
            var queries = [];
            var _this = this;
            var _scopeTags = _this.templateSrv.variables;
            options.targets.forEach(function (target) {
                if (target.hide || !(target.rawQuery || target.target)) {
                    return;
                }
                if (target.rawQueryInput) {
                    if (!target.rawQuery) {
                        return;
                    }
                    var rawQueryParts = [];
                    rawQueryParts.push(_this.templateSrv.replace(target.rawQuery, options.scopedVars));
                    if (target.alias) {
                        var legend = target.alias;
                        rawQueryParts.push(legend);
                        rawQueryParts.push(':legend');
                    }
                    queries.push(rawQueryParts.join(','));
                } else {
                    if (!target.target) {
                        return;
                    }
                    if (target.groupBys) {
                        target.groupBys = target.groupBys.filter(function (groupBy) {
                            return groupBy.name && groupBy.name.length > 0;
                        });
                    }
                    var queryParts = [];
                    queryParts.push("name," + target.target + ",:eq");
                    /* Commented out as we don't use this and this often causes "No data"
                    if (_scopeTags) {
                        for (var i = 0; i < _scopeTags.length; i++) {
                            if (_scopeTags[i].current.text != 'All') {
                                queryParts.push(_scopeTags[i].name + "," + _scopeTags[i].current.text + ",:eq,:and");
                            }
                        }
                    }
                    */
                    var hasPushAggregation = false;
                    var hasPushMath = false;
                    if (target.tags) {
                        var logicals = [];
                        for (var i = 0, len = target.tags.length; i < len; i++) {
                            var aTag = target.tags[i];
                            var valueReplaced = _this.templateSrv.replace(aTag.value);
                            // the replaced value for templates will be a comma separated list
                            if (valueReplaced.includes(',')) {
                                // len = valueReplaced.length;
                                valueReplaced = valueReplaced.replace('{', '');
                                valueReplaced = valueReplaced.replace('}', '');
                                var multipleValues = valueReplaced.split(',');
                                if ("in" === aTag.matcher) {
                                    //if (target.aggregation) {
                                    //    queryParts.push(":" + target.aggregation);
                                    //}
                                    queryParts.push(aTag.name);
                                    queryParts.push("(");
                                    queryParts.push(valueReplaced);
                                    queryParts.push(")");
                                    queryParts.push(":in");
                                    if ("not" === aTag.notCondition) {
                                        queryParts.push(":not");
                                    }
                                    logicals.push(":" + aTag.logical);
                                } else {
                                    for (var mvIndex = 0, mvLen = multipleValues.length; mvIndex < mvLen; mvIndex++) {
                                        // queryParts.push(aTag.name);

                                        queryParts.push(aTag.name);
                                        queryParts.push(multipleValues[mvIndex]);
                                        queryParts.push(":" + aTag.matcher);
                                        if ("not" === aTag.notCondition) {
                                            queryParts.push(":not");
                                        }
                                        logicals.push(":" + aTag.logical);
                                    }
                                }
                            } else {
                                // queryParts.push(aTag.name);
                                if ("in" === aTag.matcher) {
                                    // no logicals associated with this matcher

                                    if (target.math) {
                                        hasPushMath = true;
                                        queryParts.push(":" + target.math);
                                    }
                                    // legend must come before this matcher
                                    // aggregation must come before this matcher, so the name must be pushed after
                                    if (target.aggregation) {
                                        hasPushAggregation = true;
                                        queryParts.push(":" + target.aggregation);
                                    }
                                    queryParts.push(aTag.name);
                                    queryParts.push("(");
                                    queryParts.push(valueReplaced);
                                    queryParts.push(")");
                                    queryParts.push(":in");
                                } else {
                                    queryParts.push(aTag.name);
                                    queryParts.push(valueReplaced);
                                    queryParts.push(":" + aTag.matcher);
                                }
                                if ("not" === aTag.notCondition) {
                                    queryParts.push(":not");
                                }
                                if ("in" === aTag.matcher) {
                                    // logicals go before "in"
                                } else {
                                    logicals.push(":" + aTag.logical);
                                }
                            }
                        }
                        queryParts = queryParts.concat(logicals.reverse());
                    }
                    if (target.aggregation && !hasPushAggregation) {
                        queryParts.push(":" + target.aggregation);
                    }
                    if (target.math && !hasPushMath) {
                        queryParts.push(":" + target.math);
                    }
                    if (target.groupBys && target.groupBys.length > 0) {
                        queryParts.push("(");
                        target.groupBys.forEach(function (groupBy) {
                            queryParts.push(groupBy.name);
                        });
                        queryParts.push(")");
                        queryParts.push(":by");
                    }

                    if (target.alias) {
                        var aliasLegend = target.alias;
                        if (target.groupBys && target.groupBys.length > 0) {
                            var legendSuffixValue = _lodash2.default.map(target.groupBys, function (groupBy) {
                                return ' $' + groupBy.name;
                            }).join(' ');
                            aliasLegend += ' ' + legendSuffixValue;
                        }
                        queryParts.push(aliasLegend);
                        queryParts.push(':legend');
                    }

                    queries.push(queryParts.join(','));
                }
            });
            // Atlas can take multiple concatenated stack queries
            var fullQuery = queries.join(',');

            /*
            var interval = options.interval;
            if (kbn.interval_to_ms(interval) < this.minimumInterval) {
                // console.log("Detected interval smaller than allowed: " + interval);
                interval = kbn.secondsToHms(this.minimumInterval / 1000);
                // console.log("New Interval: " + interval);
            }
            */

            /*
                    var params = {
                        q: fullQuery,
                        step: interval,
                        s: options.rangeRaw.from,
                        e: options.rangeRaw.to,
                        format: this.atlasFormat
                    };
            */

            var params = {
                q: fullQuery,
                // step: interval,
                s: options.range.from.valueOf(),
                e: options.range.to.valueOf(),
                format: this.atlasFormat
            };

            var httpOptions = {
                method: 'GET',
                url: this.url + '/api/v1/graph',
                params: params,
                headers: {
                    'Content-Type': 'application/json'
                },
                inspect: {
                    type: 'atlas'
                }
            };
            // console.log("before defer");
            var deferred = this.q.defer();
            // var _this = this;
            this.backendSrv.datasourceRequest(httpOptions).then(function (response) {
                if (response.status !== 200) {
                    console.log("error...");
                    var error = new Error("Bad Status: " + response.status);
                    deferred.reject(error);
                }
                if (!response.data) {
                    var responseError = new Error("No data");
                    deferred.reject(responseError);
                }
                deferred.resolve(_this.convertToTimeseries(response.data));
            }, function (response) {
                console.error('Unable to load data. Response: %o', response.data ? response.data.message : response);
                var error = new Error("Unable to load data");
                deferred.reject(error);
            });

            return deferred.promise;
        }
    }, {
        key: "convertToTimeseries",
        value: function convertToTimeseries(result) {
            // console.log("inside convertToTimeseries");
            var timeseriesData = _lodash2.default.map(result.legend, function (legend, index) {
                var series = {
                    target: legend,
                    datapoints: []
                };
                if (legend.indexOf('NO DATA') > 0 || legend.indexOf('NO_DATA') > 0) {
                    series.allIsNull = true;
                    return series;
                }

                var values = _lodash2.default.map(result.values, index);

                var notAllZero = false;
                var notAllNull = false;
                for (var i = 0; i < values.length; i++) {
                    var value = values[i];
                    var timestamp = result.start + i * result.step;
                    series.datapoints.push([value === "NaN" ? null : value, timestamp]);
                    notAllZero = notAllZero || value !== 0;
                    notAllNull = notAllNull || value !== "NaN" && value !== undefined;
                }
                //hide zero and null results
                series.allIsZero = !notAllZero;
                series.allIsNull = !notAllNull;
                return series;
            });
            return {
                data: timeseriesData
            };
        }

        // Required
        // Used for testing datasource in datasource configuration pange

    }, {
        key: "testDatasource",
        value: function testDatasource() {
            return this.backendSrv.datasourceRequest({
                url: this.url + '/api/v1/tags',
                method: 'GET'
            }).then(function (response) {
                if (response.status === 200) {
                    return {
                        status: "success",
                        message: "Data source is working",
                        title: "Success"
                    };
                }
            });
        }
    }]);

    return AtlasDatasource;
}();
//# sourceMappingURL=datasource.js.map
