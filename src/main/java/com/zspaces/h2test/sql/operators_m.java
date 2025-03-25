package com.zspaces.h2test.sql;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface operators_m extends BaseMapper<operators_e> {
    //插入一条数据
    @Insert("insert into operators (tel, pwd, nickname, update_time) VALUES (#{tel},#{pwd},'InitialName',CURRENT_TIMESTAMP)")
    Boolean InsertOperator(Long tel, String pwd);

    //更新密码和昵称
    @Update("update operators set pwd = #{pwd} ,nickname= #{nickname}, update_time=CURRENT_TIMESTAMP where tel = #{tel}")
    Boolean UpdatePwdAndNickname(Long tel, String nickname, String pwd);

    //更新昵称
    @Update("update operators set nickname = #{nickname}, update_time=CURRENT_TIMESTAMP where tel = #{tel}")
    Boolean UpdateNickname(Long tel, String nickname);

    //模糊查询
    @Select("SELECT tel, pwd, nickname, privilege, activation, create_time, update_time from operators where cast(tel as text) like '%${tel}%' ")
    @Result(column = "create_time", property = "create_time")
    @Result(column = "update_time", property = "update_time")
    List<operators_e> SelectLike(Long tel);
}
