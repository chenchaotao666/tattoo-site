-- 删除users表中的冗余字段
-- 这些字段现在从recharges表中动态计算获得

-- 删除积分字段（现在从recharges表的remainingCredits计算）
ALTER TABLE users DROP COLUMN credits;

-- 删除余额字段（现在从recharges表的amount字段计算）
ALTER TABLE users DROP COLUMN balance;

-- 删除会员到期时间字段（现在从recharges表的chargeType和duration计算）
ALTER TABLE users DROP COLUMN membershipExpiry;