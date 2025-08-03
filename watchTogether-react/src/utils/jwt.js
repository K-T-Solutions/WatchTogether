// Функция для декодирования JWT токена (без проверки подписи)
export function decodeJwtToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

// Функция для проверки срока действия токена
export function isTokenExpired(token) {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

// Функция для получения данных пользователя из токена
export function getUserFromToken(token) {
  const decoded = decodeJwtToken(token);
  if (!decoded) return null;
  
  return {
    id: decoded.sub, // UUID пользователя
    username: decoded.username,
    // exp: decoded.exp, // время истечения
    // iat: decoded.iat  // время создания
  };
} 