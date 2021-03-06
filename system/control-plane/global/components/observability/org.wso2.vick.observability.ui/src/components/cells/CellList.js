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

import DataTable from "../common/DataTable";
import HealthIndicator from "../common/HealthIndicator";
import HttpUtils from "../../utils/api/httpUtils";
import {Link} from "react-router-dom";
import NotFound from "../common/error/NotFound";
import NotificationUtils from "../../utils/common/notificationUtils";
import Paper from "@material-ui/core/Paper";
import React from "react";
import StateHolder from "../common/state/stateHolder";
import TopToolbar from "../common/toptoolbar";
import withGlobalState from "../common/state";
import {withStyles} from "@material-ui/core/styles";
import * as PropTypes from "prop-types";

const styles = (theme) => ({
    root: {
        margin: theme.spacing.unit,
        padding: theme.spacing.unit * 3
    }
});

class CellList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cellInfo: [],
            isLoading: false
        };
    }

    loadCellInfo = (isUserAction, queryStartTime, queryEndTime) => {
        const {globalState} = this.props;
        const self = this;

        const search = {
            queryStartTime: queryStartTime.valueOf(),
            queryEndTime: queryEndTime.valueOf()
        };

        if (isUserAction) {
            NotificationUtils.showLoadingOverlay("Loading Cell Info", globalState);
            self.setState({
                isLoading: true
            });
        }
        HttpUtils.callObservabilityAPI(
            {
                url: `/http-requests/cells${HttpUtils.generateQueryParamString(search)}`,
                method: "GET"
            },
            globalState
        ).then((data) => {
            const cellInfo = data.map((dataItem) => ({
                sourceCell: dataItem[0],
                destinationCell: dataItem[1],
                httpResponseGroup: dataItem[2],
                totalResponseTimeMilliSec: dataItem[3],
                requestCount: dataItem[4]
            }));

            self.setState({
                cellInfo: cellInfo
            });
            if (isUserAction) {
                NotificationUtils.hideLoadingOverlay(globalState);
                self.setState({
                    isLoading: false
                });
            }
        }).catch(() => {
            if (isUserAction) {
                NotificationUtils.hideLoadingOverlay(globalState);
                self.setState({
                    isLoading: false
                });
                NotificationUtils.showNotification(
                    "Failed to load cell information",
                    NotificationUtils.Levels.ERROR,
                    globalState
                );
            }
        });
    };

    render = () => {
        const {classes, match} = this.props;
        const {cellInfo, isLoading} = this.state;
        const columns = [
            {
                name: "Health",
                options: {
                    customBodyRender: (value) => <HealthIndicator value={value}/>
                }
            },
            {
                name: "Cell",
                options: {
                    customBodyRender: (value) => <Link to={`${match.url}/${value}`}>{value}</Link>
                }
            },
            {
                name: "Inbound Error Rate",
                options: {
                    customBodyRender: (value) => `${Math.round(value * 100)} %`
                }
            },
            {
                name: "Outbound Error Rate",
                options: {
                    customBodyRender: (value) => `${Math.round(value * 100)} %`
                }
            },
            {
                name: "Average Response Time (ms)",
                options: {
                    customBodyRender: (value) => (Math.round(value))
                }
            },
            {
                name: "Average Inbound Request Count (requests/s)"
            }
        ];
        const options = {
            filter: false
        };

        // Processing data to find the required values
        const dataTableMap = {};
        const initializeDataTableMapEntryIfNotPresent = (cell) => {
            if (!dataTableMap[cell]) {
                dataTableMap[cell] = {
                    inboundErrorCount: 0,
                    outboundErrorCount: 0,
                    requestCount: 0,
                    totalResponseTimeMilliSec: 0
                };
            }
        };
        for (const cellDatum of cellInfo) {
            initializeDataTableMapEntryIfNotPresent(cellDatum.sourceCell);
            initializeDataTableMapEntryIfNotPresent(cellDatum.destinationCell);

            if (cellDatum.httpResponseGroup === "5xx") {
                dataTableMap[cellDatum.destinationCell].inboundErrorCount += cellDatum.requestCount;
                dataTableMap[cellDatum.sourceCell].outboundErrorCount += cellDatum.requestCount;
            }
            dataTableMap[cellDatum.destinationCell].requestCount += cellDatum.requestCount;
            dataTableMap[cellDatum.destinationCell].totalResponseTimeMilliSec += cellDatum.totalResponseTimeMilliSec;
        }

        // Transforming the objects into 2D array accepted by the Table library
        const tableData = [];
        for (const cell in dataTableMap) {
            if (dataTableMap.hasOwnProperty(cell) && Boolean(cell)) {
                const cellData = dataTableMap[cell];
                tableData.push([
                    cellData.requestCount === 0 ? -1 : 1 - cellData.inboundErrorCount / cellData.requestCount,
                    cell,
                    cellData.requestCount === 0 ? 0 : cellData.inboundErrorCount / cellData.requestCount,
                    cellData.requestCount === 0 ? 0 : cellData.outboundErrorCount / cellData.requestCount,
                    cellData.requestCount === 0 ? 0 : cellData.totalResponseTimeMilliSec / cellData.requestCount,
                    cellData.requestCount
                ]);
            }
        }

        return (
            <React.Fragment>
                <TopToolbar title={"Cells"} onUpdate={this.loadCellInfo}/>
                {
                    isLoading
                        ? null
                        : (
                            <Paper className={classes.root}>
                                {
                                    tableData.length > 0
                                        ? <DataTable columns={columns} options={options} data={tableData}/>
                                        : (
                                            <NotFound title={"No Cells Found"}
                                                description={"No Requests between cells found in the selected "
                                                    + "time range"}/>
                                        )
                                }
                            </Paper>
                        )
                }
            </React.Fragment>
        );
    };

}

CellList.propTypes = {
    classes: PropTypes.object.isRequired,
    globalState: PropTypes.instanceOf(StateHolder).isRequired,
    match: PropTypes.shape({
        url: PropTypes.string.isRequired
    }).isRequired
};

export default withStyles(styles)(withGlobalState(CellList));
