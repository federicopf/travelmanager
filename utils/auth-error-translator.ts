// Translate Supabase auth errors to Italian
export function translateAuthError(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('invalid login credentials') || 
      lowerMessage.includes('invalid credentials') ||
      lowerMessage.includes('email not confirmed')) {
    return 'Email o password non corretti. Riprova.';
  }
  
  if (lowerMessage.includes('email already registered') ||
      lowerMessage.includes('user already registered')) {
    return 'Questa email è già registrata. Accedi con le tue credenziali.';
  }
  
  if (lowerMessage.includes('password')) {
    if (lowerMessage.includes('too short') || lowerMessage.includes('weak')) {
      return 'La password è troppo debole. Usa almeno 6 caratteri.';
    }
  }
  
  if (lowerMessage.includes('email')) {
    if (lowerMessage.includes('invalid') || lowerMessage.includes('format')) {
      return 'Formato email non valido.';
    }
  }
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Errore di connessione. Controlla la tua connessione internet.';
  }
  
  // Return original message if no translation found
  return message;
}

