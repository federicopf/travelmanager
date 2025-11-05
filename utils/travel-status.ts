export function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completato';
    case 'ongoing':
      return 'In corso';
    default:
      return 'Pianificato';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#4CAF50';
    case 'ongoing':
      return '#FF9800';
    default:
      return '#2196F3';
  }
}

