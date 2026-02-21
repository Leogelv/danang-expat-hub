import '@testing-library/jest-dom';

// Мок переменных окружения для тестов
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_KEY = 'test-anon-key';
