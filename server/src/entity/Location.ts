import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { User } from './User';

@Entity()
export class Location extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    x: number;

    @Column()
    y: number;

    @ManyToOne(() => User, user => user.locations)
    user: User;
}