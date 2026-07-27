class AddDateToExpenses < ActiveRecord::Migration[7.2]
  def up
    return if column_exists?(:expenses, :date)

    add_column :expenses, :date, :date

    execute <<~SQL.squish
      UPDATE expenses
      SET date = DATE(created_at)
      WHERE date IS NULL
    SQL

    change_column_null :expenses, :date, false
  end

  def down
    return unless column_exists?(:expenses, :date)

    change_column_null :expenses, :date, true
    remove_column :expenses, :date
  end
end
