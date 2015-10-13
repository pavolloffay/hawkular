///
/// Copyright 2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///    http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

module HawkularMetrics {

    _module.provider('HawkularDatamining', function() {
        this.setProtocol = function(protocol) {
            this.protocol = protocol;
            return this;
        };



        this.setHost = function(host) {
            this.host = host;
            return this;
        };

        this.setPort = function(port) {
            this.port = 9080;
            return this;
        };

        this.$get = ['$resource', '$location', function($resource, $location) {

            this.setProtocol(this.protocol || $location.protocol() || 'http');
            this.setHost(this.host || $location.host() || 'localhost');
            this.setPort(this.port ||  $location.port() || '8080');

            var prefix = this.protocol + '://' + this.host + ':' + this.port;
            var predictionUrlPart = '/hawkular/datamining';
            var url = prefix + predictionUrlPart;
            var factory: any = {};


            factory.Predict = function(tenantId) {
                return $resource(url + '/predict/:metricId', null, {
                    predict: {
                        method: 'GET',
                        isArray: true,
                        params: {ahead: '2'},
                        headers: {'Hawkular-Tenant': tenantId}
                    }
                });
            };

            factory.Metrics = $resource(url + '/metrics/:metricId');

            factory.formatPredictedData = function(data): IChartDataPoint[] {
                function convertBytesToMegaBytes(bytes:number):number {
                    return bytes / 1024 / 1024;
                }

                var currentTimestamp = new Date().getTime();

                //  The schema is different for bucketed output
                return _.map(data.points, (point:IChartDataPoint) => {

                    point.timestamp = currentTimestamp;

                    return {
                        timestamp: point.timestamp,
                        date: new Date(point.timestamp),
                        value: 0,
                        avg: convertBytesToMegaBytes(point.value),
                        min: 0,
                        max: 0,
                        percentile95th: 0,
                        median: 0,
                        empty: false
                    };
                });
            };

            return factory;
        }];
    });
}
