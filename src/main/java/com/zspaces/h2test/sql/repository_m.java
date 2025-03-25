package com.zspaces.h2test.sql;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface repository_m extends BaseMapper<repository_e> {
    @Insert("INSERT INTO repository(name, isn, category, cost, price, stock, promoting, update_time) values (#{tradeName},#{tradeISN},#{tradeCategory},#{tradeCost},#{tradePrice},#{tradeStock},#{tradePromoting},CURRENT_TIMESTAMP)")
    Boolean InsertRepository(String tradeName, Long tradeISN, String tradeCategory, Double tradeCost, Double tradePrice, Long tradeStock, Double tradePromoting);

    @Select("SELECT name, isn, category, cost, price, stock, promoting, update_time FROM repository where cast(name as text) like '%${searchKey}%'")
    @Result(column = "update_time", property = "update_time")
    List<repository_e> SelectLike(String searchKey);

    @Select("SELECT name, isn, category, cost, price, stock, promoting, update_time FROM repository where isn = #{searchISN}")
    @Result(column = "update_time", property = "update_time")
    List<repository_e> SelectISN(Long searchISN);
}
