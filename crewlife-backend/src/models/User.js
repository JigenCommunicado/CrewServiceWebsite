const { query, transaction } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.fullName = data.full_name;
    this.password = data.password;
    this.position = data.position;
    this.location = data.location;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.lastLogin = data.last_login;
  }

  // Создание нового пользователя
  static async create(userData) {
    const { employeeId, fullName, password, position, location } = userData;
    
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const sql = `
      INSERT INTO users (employee_id, full_name, password, position, location)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [employeeId, fullName, hashedPassword, position, location]);
    return result.insertId;
  }

  // Поиск пользователя по табельному номеру
  static async findByEmployeeId(employeeId) {
    const sql = 'SELECT * FROM users WHERE employee_id = ? AND is_active = TRUE';
    const rows = await query(sql, [employeeId]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Поиск пользователя по ID
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
    const rows = await query(sql, [id]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Получение всех пользователей
  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT id, employee_id, full_name, position, location, is_active, created_at, last_login
      FROM users 
      WHERE is_active = TRUE
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await query(sql, [limit, offset]);
    return rows.map(row => new User(row));
  }

  // Поиск пользователей по критериям
  static async search(criteria) {
    let sql = 'SELECT * FROM users WHERE is_active = TRUE';
    const params = [];
    
    if (criteria.fullName) {
      sql += ' AND full_name LIKE ?';
      params.push(`%${criteria.fullName}%`);
    }
    
    if (criteria.position) {
      sql += ' AND position = ?';
      params.push(criteria.position);
    }
    
    if (criteria.location) {
      sql += ' AND location = ?';
      params.push(criteria.location);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const rows = await query(sql, params);
    return rows.map(row => new User(row));
  }

  // Обновление данных пользователя
  async update(updateData) {
    const allowedFields = ['full_name', 'position', 'location'];
    const updates = [];
    const params = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
    
    if (updates.length === 0) {
      return false;
    }
    
    params.push(this.id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // Обновление пароля
  async updatePassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    const result = await query(sql, [hashedPassword, this.id]);
    return result.affectedRows > 0;
  }

  // Проверка пароля
  async checkPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Обновление времени последнего входа
  async updateLastLogin() {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await query(sql, [this.id]);
    return result.affectedRows > 0;
  }

  // Деактивация пользователя
  async deactivate() {
    const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
    const result = await query(sql, [this.id]);
    return result.affectedRows > 0;
  }

  // Активация пользователя
  async activate() {
    const sql = 'UPDATE users SET is_active = TRUE WHERE id = ?';
    const result = await query(sql, [this.id]);
    return result.affectedRows > 0;
  }

  // Получение статистики пользователей
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_users,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_registrations
      FROM users
    `;
    const rows = await query(sql);
    return rows[0];
  }

  // Проверка существования табельного номера
  static async isEmployeeIdExists(employeeId, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE employee_id = ?';
    const params = [employeeId];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const rows = await query(sql, params);
    return rows[0].count > 0;
  }

  // Преобразование в объект для API (без пароля)
  toJSON() {
    return {
      id: this.id,
      employeeId: this.employeeId,
      fullName: this.fullName,
      position: this.position,
      location: this.location,
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = User;
