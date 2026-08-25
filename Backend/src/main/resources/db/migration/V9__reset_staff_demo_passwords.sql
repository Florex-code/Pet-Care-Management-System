UPDATE app_users
SET password_hash = '$2a$10$zCQskxaejgLJwxFiJunWq.nV0dqeb.j8c4v4Eo8iuMyF4fsgpLc9C'
WHERE email IN ('admin@pawcare.test', 'vet@pawcare.test');
