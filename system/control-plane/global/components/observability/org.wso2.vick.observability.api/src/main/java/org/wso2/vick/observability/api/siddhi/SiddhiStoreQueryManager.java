/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.wso2.vick.observability.api.siddhi;

import org.wso2.siddhi.core.SiddhiAppRuntime;
import org.wso2.siddhi.core.SiddhiManager;
import org.wso2.siddhi.core.event.Event;

/**
 * Manager for running Siddhi Store Queries.
 * This doesn't need to be accessed directly except for starting and stopping the service.
 * For executing use {@link SiddhiStoreQueryTemplates}.
 */
public class SiddhiStoreQueryManager {
    private static final String DISTRIBUTED_TRACING_TABLE_DEFINITION = "@Store(type=\"rdbms\", " +
            "datasource=\"CELLERY_OBSERVABILITY_DB\", field.length=\"tags:8000\")\n" +
            "@PrimaryKey(\"traceId\", \"spanId\", \"kind\")\n" +
            "@purge(enable=\"false\")\n" +
            "define table DistributedTracingTable (traceId string, spanId string, parentId string, namespace string, " +
            "cell string, serviceName string, pod string, operationName string, kind string, startTime long, " +
            "duration long, tags string);";
    private static final String REQUEST_AGGREGATION_DEFINITION = "define stream ProcessedRequestsStream(" +
            "sourceCell string, sourceVICKService string, destinationCell string, destinationVICKService string, " +
            "httpResponseGroup string, responseTimeMilliSec double, requestSizeBytes long, responseSizeBytes long);" +
            "@store(type=\"rdbms\", datasource=\"CELLERY_OBSERVABILITY_DB\")\n" +
            "@purge(enable=\"false\")\n" +
            "define aggregation RequestAggregation from ProcessedRequestsStream\n" +
            "select sourceCell, sourceVICKService, destinationCell, destinationVICKService, httpResponseGroup, " +
            "sum(responseTimeMilliSec) as totalResponseTimeMilliSec, sum(requestSizeBytes) as totalRequestSizeBytes," +
            "sum(responseSizeBytes) as totalResponseSizeBytes, " +
            "count() as requestCount\n" +
            "group by sourceCell, sourceVICKService, destinationCell, destinationVICKService, httpResponseGroup\n" +
            "aggregate every sec...year;";
    private static final String K8S_POD_INFO_TABLE = "@Store(type=\"rdbms\", datasource=\"CELLERY_OBSERVABILITY_DB\")\n" +
            "@PrimaryKey(\"cell\", \"component\", \"name\")\n" +
            "@purge(enable=\"false\")\n" +
            "define table K8sPodInfoTable (cell string, component string, name string, creationTimestamp long, " +
            "lastKnownAliveTimestamp long, nodeName string);";

    private static final String SIDDHI_APP = DISTRIBUTED_TRACING_TABLE_DEFINITION + "\n" +
            REQUEST_AGGREGATION_DEFINITION + "\n" + K8S_POD_INFO_TABLE;

    private SiddhiAppRuntime siddhiAppRuntime;

    public SiddhiStoreQueryManager() {
        SiddhiManager siddhiManager = new SiddhiManager();

        siddhiAppRuntime = siddhiManager.createSiddhiAppRuntime(SIDDHI_APP);
        siddhiAppRuntime.start();
    }

    /**
     * Run Siddhi Store Query and get the results.
     *
     * @param siddhiQuery Siddhi Store Query to run
     * @return The results of the Siddhi Store Query
     */
    Event[] query(String siddhiQuery) {
        return siddhiAppRuntime.query(siddhiQuery);
    }

    /**
     * Stop the Siddhi Store Query Manager.
     * This will stop the siddhi App run time to clear any resources allocated.
     */
    public void stop() {
        siddhiAppRuntime.shutdown();
    }
}
