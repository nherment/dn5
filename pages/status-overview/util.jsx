
import moment from 'moment'

const UNSTABLE_TO_INCIDENT_DURATION_THRESHOLD = 5 * 60 * 1000

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
    label: 'Incident resolution in progress'
  }
}

function calculateIncidentStatusLevel(incident) {
  if(!incident.closedDate && incidentDurationMS(incident) > UNSTABLE_TO_INCIDENT_DURATION_THRESHOLD) {
    return StatusLevels.incident
  } else if(!incident.closedDate) {
    return StatusLevels.unstable
  } else {
    return StatusLevels.operational
  }
}

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



function deserializeIncident(incident) {
  incident.createdDate = moment(incident.createdDate)
  if(incident.acknowledgedDate) {
    incident.acknowledgedDate = moment(incident.acknowledgedDate)
  }
  if(incident.closedDate) {
    incident.closedDate = moment(incident.closedDate)
  }
  if(incident.events) {
    incident.events.forEach(event => event.createdDate = moment(event.createdDate))
  }

}

function deserializeMonitor(monitor) {
  monitor.lastCheckDate = moment(monitor.lastCheckDate)
  monitor.status = calculateMonitorStatusLevel(monitor)
  if(monitor.activeIncident) {
    deserializeIncident(monitor.activeIncident)
  }
  if(monitor.closedIncidents) {
    monitor.closedIncidents.forEach(deserializeIncident)
  }

}

function humanReadableTimeDifference(from, to) {
  if(!from || !to) {
    return '';
  }

  var duration = moment.duration(moment(to).diff(from), 'milliseconds');
  var humanReadableTimeDifference = '';

  if(duration.years()) {
    humanReadableTimeDifference += Math.abs(duration.years()) + 'y';
    if(duration.months()) {
      humanReadableTimeDifference += ' ' + Math.abs(duration.months()) + 'm';
    }
  } else if(duration.months()) {
    humanReadableTimeDifference += Math.abs(duration.months()) + 'm';
    if(duration.days()) {
      humanReadableTimeDifference += ' ' + Math.abs(duration.days()) + 'd';
    }
  } else if(duration.days()) {
    humanReadableTimeDifference += Math.abs(duration.days()) + 'd';
    if(duration.hours()) {
      humanReadableTimeDifference += ' ' + Math.abs(duration.hours()) + 'h';
    }
  } else if(duration.hours()) {
    humanReadableTimeDifference += Math.abs(duration.hours()) + 'h';
    if(duration.minutes()) {
      humanReadableTimeDifference += ' ' + Math.abs(duration.minutes()) + 'min';
    }
  } else if(duration.minutes()) {
    humanReadableTimeDifference += Math.abs(duration.minutes()) + 'min';
  } else if(duration.seconds()) {
    humanReadableTimeDifference += Math.abs(duration.seconds()) + 's';
  } else {
    humanReadableTimeDifference = '0s'
  }

  return humanReadableTimeDifference;
}


const truncateDecimals = (number, digits) => {
  if(!digits) {
    digits = 0;
  }
  var multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
  return truncatedNum / multiplier;
};

export {
  StatusLevels,
  calculateIncidentStatusLevel,
  calculateMonitorStatusLevel,
  deserializeMonitor,
  humanReadableTimeDifference,
  truncateDecimals
}