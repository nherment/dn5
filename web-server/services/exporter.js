
const xl = require('excel4node')
const monitors = require('./monitors')
const moment = require('moment')

function formalDate(dateStr) {
  return moment(dateStr).format('YYYY-MM-DD HH:mm:ss [UTC]Z')
}
function informalDate(dateStr) {
  return moment(dateStr).format('DD MMM YYYY [at] HH:mm ([UTC]Z)')
}

module.exports = {
  /**
   * 
   * @param integer userId 
   * @param integer monitorId 
   * @param function callback 
   */
  exportMonitorToExcel: (user, monitorId, callback) => {
    monitors.fetchMonitorHistory(monitorId, (err, monitor) => {
      if(err) return callback(err, null)
      if(!monitor) return callback(new Error('Could not find monitor'), null)

      if(!monitor.isPublic && !user) {
        return callback(new Error('Forbidden. Please log in to access this report'), null);
      }
      const wb = new xl.Workbook({
        jszip: {
          compression: 'DEFLATE'
        },
        defaultFont: {
          size: 10,
          name: 'Arial',
          color: '#000000'
        }
      })
      const ws = wb.addWorksheet(`${monitor.name}`, {
        sheetView: {
          showGridLines: false
        }
      })

      const monitoringReportNameStyle = wb.createStyle({
        font: {
          bold: true,
          color: '#124D6A',
          size: 20
        }
      })

      const mainTextStyle = wb.createStyle({
        font: {
          bold: true,
          color: '#124D6A'
        },
        alignment: {
          vertical: 'center'
        }
      })
      
      const labelStyle = wb.createStyle({
        font: {
          color: '#555555'
        },
        alignment: {
          vertical: 'center'
        }
      })

      const descriptionStyle = wb.createStyle({
        alignment: {
          wrapText: true,
          vertical: 'center'
        },
        font: {
          color: '#000000'
        }
      })

      const footerTextStyle = wb.createStyle({
        font: {
          size: 9,
          color: '#A7A8AA'
        }
      })

      const incidentBorderLeft = wb.createStyle({
        border: {
          top: {
            style: 'thin',
            color: '#A7A8AA'
          },
          bottom: {
            style: 'thin',
            color: '#A7A8AA'
          },
          left: {
            style: 'thin',
            color: '#A7A8AA'
          }
        }
      })
      const incidentBorderCenter = wb.createStyle({
        border: {
          top: {
            style: 'thin',
            color: '#A7A8AA'
          },
          bottom: {
            style: 'thin',
            color: '#A7A8AA'
          }
        }
      })
      const incidentBorderRight = wb.createStyle({
        border: {
          top: {
            style: 'thin',
            color: '#A7A8AA'
          },
          right: {
            style: 'thin',
            color: '#A7A8AA'
          },
          bottom: {
            style: 'thin',
            color: '#A7A8AA'
          }
        }
      })



      ws.column(1).setWidth(5)
      ws.column(2).setWidth(2)
      ws.column(3).setWidth(18)
      ws.column(4).setWidth(2)
      ws.column(5).setWidth(6)
      ws.column(6).setWidth(8)
      ws.column(7).setWidth(28)
      ws.column(8).setWidth(8)
      ws.column(9).setWidth(28)
      ws.column(10).setWidth(2)
      ws.column(11).setWidth(60)
      ws.column(12).setWidth(2)
      ws.column(13).setWidth(5)
      
      ws.row(3).setHeight(24)

      let vCursor = 3
      ws.cell(vCursor, 3, vCursor, 11, true).string(monitor.name || '').style(monitoringReportNameStyle)
      vCursor ++
      ws.cell(vCursor, 3, vCursor, 11, true).string('(Monitoring report)').style(labelStyle)
      vCursor ++
      ws.cell(vCursor, 3, vCursor, 11, true).string(`Covering incidents from ${informalDate(monitor.minDate)} to ${informalDate(monitor.maxDate)}`)

      vCursor +=2

      if(monitor.incidents && monitor.incidents.length > 0) {
        monitor.incidents.forEach((incident) => {
          ws.cell(vCursor, 3, vCursor, 5, true).string(incident.title || '').style(mainTextStyle)
          ws.cell(vCursor, 6).string('created:').style(labelStyle)
          ws.cell(vCursor, 7).string(formalDate(incident.createdDate) || '').style(mainTextStyle)
          ws.cell(vCursor, 8).string('closed:').style(labelStyle)
          ws.cell(vCursor, 9).string(formalDate(incident.closedDate) || '').style(mainTextStyle)

          let description = incident.description
          let rows = null
          if(!description && incident.events && incident.events.length > 0) {
            rows = 0
            description = incident.events.filter(event => {
                return !!event.description
              }).map(event => {
              rows++
              const eventDescription = `${informalDate(event.createdDate)}: ${event.description}`
              if(eventDescription.length > 50) {
                rows++
              }
              return eventDescription
            }).join('\n')
          }

          ws.cell(vCursor, 11).string(description || '').style(descriptionStyle)

          if(!rows && description && description.length > 50) {
            rows = Math.ceil(description.length / 50)
          }
          if(rows) {
            ws.row(vCursor).setHeight(Math.ceil(rows * 14))
          }

          ws.cell(vCursor, 3).style(incidentBorderLeft)
          ws.cell(vCursor, 4).style(incidentBorderCenter)
          ws.cell(vCursor, 5).style(incidentBorderCenter)
          ws.cell(vCursor, 6).style(incidentBorderCenter)
          ws.cell(vCursor, 7).style(incidentBorderCenter)
          ws.cell(vCursor, 8).style(incidentBorderCenter)
          ws.cell(vCursor, 9).style(incidentBorderCenter)
          ws.cell(vCursor, 10).style(incidentBorderCenter)
          ws.cell(vCursor, 11).style(incidentBorderRight)
          vCursor++
        })
      }

      //------------------------//
      //--    Footer text     --//
      vCursor+=2
      ws.cell(vCursor, 3, vCursor, 9, true).string(`File created ${informalDate(monitor.toDate)}.`).style(footerTextStyle)


      wb.writeToBuffer()
      .then((buffer) => {
        console.info('Generated excel buffer.')
        callback(undefined, {monitor, xlsx: buffer})
      })
      .catch(err => {
        console.error(err)
        callback(err)
      })
    })
  }

}