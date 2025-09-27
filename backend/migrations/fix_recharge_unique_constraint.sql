-- 修复recharges表的唯一约束问题
-- 原约束对Credit类型充值造成冲突，需要调整约束逻辑

-- 删除原来的唯一约束
ALTER TABLE recharges DROP INDEX uq_user_month;

-- 方案1：不添加约束，通过应用层逻辑控制系统月赠的幂等性
-- 这是最简单的解决方案，适合当前的积分购买系统

-- 方案2：如果需要系统月赠的幂等保护，可以使用以下方案：
-- 创建一个只包含非空gift_month记录的唯一索引
-- CREATE UNIQUE INDEX idx_user_month_gift ON recharges (userId, gift_month, chargeType)
-- WHERE gift_month IS NOT NULL AND gift_month != '';

-- 当前采用方案1，删除约束即可解决Credit充值冲突问题