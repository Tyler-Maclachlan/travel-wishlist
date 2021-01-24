import { Entity, PrimaryGeneratedColumn, OneToMany, Column, BaseEntity } from "typeorm";
import { Location } from "./Location";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    socketId: string;
    
    @OneToMany(() => Location, location => location.user, { eager: true })
    locations: Location[];
}
