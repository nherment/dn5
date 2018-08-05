

import React from 'react'
import styled from 'styled-components'
import moment from 'moment'
import MonitorIncidentReport from './MonitorIncidentReport'

import {
  SystemIcon,
  ExclamationMark,
  CancelMark,
  CheckMark
} from './icons'

import { colorFromStatus } from '../colors'
import { StatusLevels, deserializeMonitor, truncateDecimals } from './util'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const Overview = styled.div`
  max-width: 500px;
  margin: 40px auto 50px auto;
`

const OverviewPrimaryContent = styled.div`
  width: 100%;
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  margin-top: 30px;
  & > svg {
    margin-bottom: 20px;
  }
`

const OverviewSecondaryContent = styled.div`
  width: 100%;
  text-align: center;
  color: #BBBBBB;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
`

const MonitorsOverview = styled.div`
  max-width: 800px;
  width: calc(100% - 40px);
  margin: 0 auto;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-content: flex-start;
`

const MonitorOverview = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
`
const MonitorDetails = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Monitor = styled.div`
  margin: 5px;
  width: 340px;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  position: relative;
  padding: 20px;
  height: 40px;
  cursor: pointer;

  & > ${MonitorDetails} {
    display: none;
  }
  &:hover > ${MonitorDetails} {
    display: block;
  }

  &:hover > ${MonitorOverview} {
    display: none;
  }
`
const MonitorName = styled.div`
  font-size: 20px;
  font-weight: bold;
`
const MonitorUptime = styled.div`
  font-size: 14px;
  color: #BBBBBB;
`
const MonitorStatus = styled.div`
  width: 40px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;

`
const MonitorStatusIcon = styled.div`
  & > svg {
    width: 30px;
    height: 30px;
  }
`
const MonitorStatusLabel = styled.div`
  text-transform: capitalize;
  font-size: 12px;
`

const Footer = styled.footer`
  margin: 20px 0;
  width: 100%;
  text-align: right;
`

const Header = styled.header`
  padding: 0 20px;
  width: calc(100% - 40px);
  height: 30px;

  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
`

class StatusOverview extends React.Component {

  state = {
    status: StatusLevels.operational,
    lastUpdatedDate: moment(),
    monitors: this.props.monitors || [],
    selectedMonitor: null
  }
  refreshUpdatedDateLabel = () => {
    this.setState({lastUpdatedDateLabel: this.state.lastUpdatedDate.fromNow()})
  }

  refreshMonitors = () => {
    fetch(`/api/monitors-statuses`, {credentials: 'include'})
      .then((response) => {
        return response.json()
      }).then(monitors => {

        let highestStatus = StatusLevels.operational;

        monitors.forEach(monitor => {
          deserializeMonitor(monitor)

          if(monitor.status.level > highestStatus.level) {
            highestStatus = monitor.status
          }
        })

        this.setState({
          status: highestStatus,
          monitors: monitors,
          lastUpdatedDate: moment(),
          lastUpdatedDateLabel: moment().fromNow()
        })
      })
    this.refreshMonitor()
  }
  refreshMonitor = () => {
    if(this.state.selectedMonitor && this.state.selectedMonitor.id) {
      fetch(`/api/monitor/${this.state.selectedMonitor.id}`, {credentials: 'include'})
        .then((response) => {
          return response.json()
        }).then(selectedMonitor => {
          deserializeMonitor(selectedMonitor)
          this.setState({selectedMonitor})
        })
    }
  }

  componentDidMount = () => {
    this.refreshMonitors()
    this.interval = setInterval(() => {
      this.refreshMonitors()
    }, 5000)
    this.intervalLabel = setInterval(() => {
      this.refreshUpdatedDateLabel()
    }, 5000)
  }
  componentWillUnmount = () => {
    clearInterval(this.interval)
    clearInterval(this.intervalLabel)
  }

  viewMonitorDetails = (monitor) => {
    this.setState({selectedMonitor: monitor}, () => {
      this.refreshMonitor()
    })
  }
  closeMonitorDetails = () => {
    this.setState({selectedMonitor: null})
  }
  renderMonitor = (monitor) => {
    return (
      <Monitor key={monitor.id} onClick={() => this.viewMonitorDetails(monitor)}>
        <MonitorOverview>
          <MonitorName>
            {monitor.name}
            <MonitorUptime>{truncateDecimals(monitor.rollingMonthUptime, 2)}% uptime for the last 30 days</MonitorUptime>
          </MonitorName>
          <MonitorStatus>
            <MonitorStatusIcon>
              {monitor.status.name === 'operational' && <CheckMark />}
              {monitor.status.name === 'unstable' && <ExclamationMark status="unstable"/>}
              {monitor.status.name === 'incident' && <CancelMark status="incident" />}
            </MonitorStatusIcon>
            <MonitorStatusLabel style={{color: colorFromStatus(monitor.status.name)}}>
              {monitor.status.name}
            </MonitorStatusLabel>
          </MonitorStatus>
        </MonitorOverview>
        <MonitorDetails>
          <div>Click to see detailed information</div>
        </MonitorDetails>
      </Monitor>
    )
  }

  render() {
    return (
      <Container>
        <Header>
          <a href="/auth/login">login</a>
        </Header>
        <Overview>
          <OverviewPrimaryContent>
            <SystemIcon width="128" height="128" status={this.state.status.name}/>
            <div>{this.state.status.label}</div>
          </OverviewPrimaryContent>
          <OverviewSecondaryContent>Last updated: {this.state.lastUpdatedDateLabel}</OverviewSecondaryContent>
        </Overview>
        <MonitorsOverview>
          {!this.state.selectedMonitor && this.state.monitors.map(this.renderMonitor)}
          {this.state.selectedMonitor && <MonitorIncidentReport monitor={this.state.selectedMonitor} onClose={this.closeMonitorDetails}/>}
          <Footer>
            If you are experiencing an issue, please contact <a href="mailto:support@portchain.com">support</a>.
          </Footer>
        </MonitorsOverview>

      </Container>
    )
  }
}

export default StatusOverview