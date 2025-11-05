-- Remove avatarUrl antigo para forçar regeneração com pageId correto
UPDATE pages SET "avatarUrl" = NULL WHERE id = '8d1fea70-c939-4dc8-afdc-682ef6f67a7e';
