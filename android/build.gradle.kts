allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = file("../build")
subprojects {
    project.buildDir = file("${rootProject.buildDir}/${project.name}")
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<org.gradle.api.tasks.Delete>("clean") {
    delete(rootProject.buildDir)
}

// allprojects {
//     repositories {
//         google()
//         mavenCentral()
//     }
// }

// rootProject.buildDir = file("../build")
// subprojects {
//     project.buildDir = file("${rootProject.buildDir}/${project.name}")
// }

// tasks.register<org.gradle.api.tasks.Delete>("clean") {
//     delete(rootProject.buildDir)
// }
