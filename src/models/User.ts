import { Model, Table, Column, DataType, BelongsTo, ForeignKey, Default, Unique, AllowNull } from 'sequelize-typescript'

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


}

export default User