class StatusRecord {
  isSuccess: boolean
  created: number
  constructor(isSuccess: boolean) {
    this.isSuccess = isSuccess
    this.created = Date.now()
  }
}

class StatusRecords {
  name: string
  items: StatusRecord[]
  lastUpdated: number
  constructor(name: string) {
    this.name = name
    this.items = []
    this.lastUpdated = Date.now()
    statusAnalysis.add(this)
  }
  get size() {
    return this.items.length
  }
  get updateNeeded(): boolean {
    return this.lastUpdated + 60000 < Date.now()
  }
  get status(): number {
    return this.items.filter(s => s.isSuccess).length / this.size
  }
  record(isSuccess: boolean) {
    const items = this.items
    items.push(new StatusRecord(isSuccess))
    if (!this.updateNeeded) return
    const now = Date.now()
    if (items.length) {
      while (now - items[0].created > 900000) items.shift()
      this.lastUpdated = now
    } else statusAnalysis.delete(this)
  }
}

export const statusAnalysis = {
  items: [] as StatusRecords[],
  get(recordName: string) {
    return statusAnalysis.items.find(r => r.name === recordName) || new StatusRecords(recordName)
  },
  add(records: StatusRecords) {
    statusAnalysis.items = [...statusAnalysis.items, records]
  },
  delete(records: StatusRecords) {
    const i = statusAnalysis.items.indexOf(records)
    if (i !== -1) statusAnalysis.items.splice(i, 1)
  },
  get table() {
    return statusAnalysis.items.map((r) => [r.name, r.status] as [string, number])
  },
  record(recordName: string, isSuccess: boolean) {
    return statusAnalysis.get(recordName).record(isSuccess)
  }
}

export default statusAnalysis;
