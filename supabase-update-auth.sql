-- Adicionar colunas de gamificação à tabela users existente
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS missions_completed INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_accuracy INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

-- Atualizar referências na tabela mission_results
ALTER TABLE mission_results DROP CONSTRAINT IF EXISTS mission_results_player_id_fkey;
ALTER TABLE mission_results ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Policies para users
DROP POLICY IF EXISTS "Allow public read users" ON users;
DROP POLICY IF EXISTS "Allow public insert users" ON users;
DROP POLICY IF EXISTS "Allow public update users" ON users;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);
