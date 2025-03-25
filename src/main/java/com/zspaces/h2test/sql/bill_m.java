package com.zspaces.h2test.sql;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface bill_m extends BaseMapper<bill_e> {

    @Select("select purchased from bill where id = #{id}")
    String SelectPurchasedById(Long id);

    @Insert("insert into bill (id, member, sum, purchased) values (#{id},#{member},#{sum},#{purchased})")
    Boolean InsertData(Long id, Long member, String purchased, Double sum);

    @Update("update bill set state = #{state} where id = #{id}")
    Boolean UpdateState(Long id, Boolean state);


    @Select("SELECT id, member, sum, purchased, create_time, state FROM bill where cast(id as text) like '%${id}%'")
    @Result(column = "create_time", property = "create_time")
    List<bill_e> SearchBill(Long id);
}
