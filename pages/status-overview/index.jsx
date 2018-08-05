

import React from 'react'
import styled from 'styled-components'
import moment from 'moment'

import {
  SystemIcon,
  ExclamationMark,
  CancelMark,
  CheckMark,
  colorFromStatus
} from './icons'

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
const Monitor = styled.div`
  margin: 5px;
  width: 340px;
  padding: 20px;
  border: 1px solid #CCCCCC;
  border-radius: 4px;

  display: flex;
  justify-content: space-between;
  align-items: center;
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
const StatusLevels = {
  operational: {
    level: 0,
    name: 'operational',
    label: 'All systems fully operational'
  }, 
  unstable: {
    level: 1,
    name: 'unstable',
    label: 'Some instability has been noticed'
  }, 
  incident: {
    level: 2,
    name: 'incident',
    label: 'Incident detected'
  }
}

const UNSTABLE_TO_INCIDENT_DURATION_THRESHOLD = 5 * 60 * 1000

const truncateDecimals = (number, digits) => {
  var multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
  return truncatedNum / multiplier;
};

function incidentDurationMS(incident) {
  return moment().diff(incident.createdDate)
}

function calculateMonitorStatusLevel(monitor) {
  if(monitor.activeIncident && incidentDurationMS(monitor.activeIncident) > UNSTABLE_TO_INCIDENT_DURATION_THRESHOLD) {
    return StatusLevels.incident
  } else if(monitor.activeIncident) {
    return StatusLevels.unstable
  } else {
    return StatusLevels.operational
  }
}

class StatusOverview extends React.Component {

  state = {
    status: StatusLevels.operational,
    lastUpdatedDate: moment(),
    monitors: this.props.monitors || []
  }

  refreshMonitors = () => {
    fetch(`/api/monitors-statuses`, {credentials: 'include'})
      .then((response) => {
        return response.json()
      }).then(monitors => {

        let highestStatus = StatusLevels.operational;

        monitors.forEach(monitor => {
          monitor.status = calculateMonitorStatusLevel(monitor)
          if(monitor.status.level > highestStatus.level) {
            highestStatus = monitor.status
          }
        })

        this.setState({
          status: highestStatus,
          monitors: monitors
        })
      })
  }

  componentDidMount = () => {
    this.refreshMonitors()
    this.interval = setInterval(() => {
      this.refreshMonitors()
    }, 5000)
  }
  componentWillUnmount = () => {
    clearInterval(this.interval)
  }
  renderMonitor(monitor) {
    return (
      <Monitor key={monitor.id}>
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
      </Monitor>
    )
  }

  render() {
    return (
      <Container>
        <Header>
          <a href="/auth/login">Login</a>
        </Header>
        <Overview>
          <OverviewPrimaryContent>
            <SystemIcon width="128" height="128" status={this.state.status.name}/>
            <div>{this.state.status.label}</div>
          </OverviewPrimaryContent>
          <OverviewSecondaryContent>Last updated: {this.state.lastUpdatedDate.fromNow()}</OverviewSecondaryContent>
        </Overview>
        <MonitorsOverview>
          {this.state.monitors.map(this.renderMonitor)}
          <Footer>
            If you are experiencing an issue, please contact <a href="mailto:support@portchain.com">support</a>.
          </Footer>
        </MonitorsOverview>
      </Container>
    )
  }
}

export default StatusOverview