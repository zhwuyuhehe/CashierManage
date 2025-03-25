package com.zspaces.h2test.config;

import com.zspaces.h2test.util.bill;
import com.zspaces.h2test.util.members;
import com.zspaces.h2test.util.operators;
import com.zspaces.h2test.util.repository;
import org.graalvm.nativeimage.hosted.Feature;
import org.graalvm.nativeimage.hosted.RuntimeSerialization;

public class LambdaRegistrationFeature implements Feature {
    @Override
    public void duringSetup(DuringSetupAccess access) {
        // TODO 这里需要将lambda表达式所使用的成员类都注册上来,具体情况视项目情况而定,一般扫描@Controller和@Service的会多点.
        RuntimeSerialization.registerLambdaCapturingClass(bill.class);
        RuntimeSerialization.registerLambdaCapturingClass(members.class);
        RuntimeSerialization.registerLambdaCapturingClass(operators.class);
        RuntimeSerialization.registerLambdaCapturingClass(repository.class);

    }
}
