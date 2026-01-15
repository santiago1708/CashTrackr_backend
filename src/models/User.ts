import { Model, Table, Column, DataType, Default, Unique, AllowNull, HasMany } from 'sequelize-typescript'
import Budget from './Budget'

@Table ({
    tableName: 'User'
})

class User extends Model {
    @AllowNull(false)
    @Column({
        type: DataType.STRING(50)
    })
    declare name: string
    
    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare password: string
    
    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING(50)
    })
    declare email: string
    
    @Column({
        type: DataType.STRING(6)
    })
    declare token: string
    
    @Default(false)
    @Column({
        type: DataType.BOOLEAN
    })
    declare confirmed: boolean

    @HasMany(() => Budget, {
        onUpdate : 'CASCADE',
        onDelete : 'CASCADE'
    })
    declare budgets : Budget[]

}

export default User