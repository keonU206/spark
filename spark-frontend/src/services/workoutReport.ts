import type { ExerciseType } from './aiPose';

export type ReportIssueType =
  | 'SHALLOW_DEPTH'
  | 'TORSO_LEAN'
  | 'KNEE_IMBALANCE'
  | 'FRONT_LEG_UNCLEAR'
  | 'SIDE_IMBALANCE';

export type ReportIssue = {
  type: ReportIssueType;
  count: number;
  message: string;
};

export type WorkoutAnalysisReport = {
  exerciseType: 'squat' | 'lunge';
  totalReps: number;
  validReps: number;
  score: number;
  metrics: {
    averageDepthAngle: number;
    averageTorsoTilt: number;
    averageKneeDifference: number;
    leftReps?: number;
    rightReps?: number;
  };
  issues: ReportIssue[];
  summary: string;
};

export type RepMeasurement = {
  leftKneeAngle: number;
  rightKneeAngle: number;
  torsoTilt: number;
};

type StoredRep = RepMeasurement & {
  valid: boolean;
  frontLeg?: 'left' | 'right';
};

const ISSUE_MESSAGES: Record<ReportIssueType, string> = {
  SHALLOW_DEPTH: '무릎을 조금 더 굽혀 충분한 깊이까지 내려가 보세요.',
  TORSO_LEAN: '상체를 조금 더 세워주세요.',
  KNEE_IMBALANCE: '양쪽 무릎을 균형 있게 움직여주세요.',
  FRONT_LEG_UNCLEAR: '앞다리가 구분되도록 보폭을 조금 더 넓혀주세요.',
  SIDE_IMBALANCE: '왼쪽과 오른쪽 런지를 비슷한 횟수로 수행해 주세요.',
};

export class WorkoutReportBuilder {
  private type: ExerciseType;
  private reps: StoredRep[] = [];
  private issueCounts = new Map<ReportIssueType, number>();

  constructor(type: ExerciseType) {
    this.type = type;
  }

  reset(type: ExerciseType = this.type) {
    this.type = type;
    this.reps = [];
    this.issueCounts.clear();
  }

  addRep(measurement: RepMeasurement) {
    if (this.type !== 'squat' && this.type !== 'lunge') return;

    const depth = (measurement.leftKneeAngle + measurement.rightKneeAngle) / 2;
    const kneeDifference = Math.abs(measurement.leftKneeAngle - measurement.rightKneeAngle);
    let valid = true;
    let frontLeg: 'left' | 'right' | undefined;

    if (this.type === 'squat') {
      if (depth > 110) {
        this.addIssue('SHALLOW_DEPTH');
        valid = false;
      }
      if (kneeDifference > 18) {
        this.addIssue('KNEE_IMBALANCE');
        valid = false;
      }
      if (measurement.torsoTilt > 35) {
        this.addIssue('TORSO_LEAN');
        valid = false;
      }
    } else {
      const frontDepth = Math.min(measurement.leftKneeAngle, measurement.rightKneeAngle);
      if (frontDepth > 115) {
        this.addIssue('SHALLOW_DEPTH');
        valid = false;
      }
      if (kneeDifference < 8) {
        this.addIssue('FRONT_LEG_UNCLEAR');
        valid = false;
      } else {
        frontLeg = measurement.leftKneeAngle < measurement.rightKneeAngle ? 'left' : 'right';
      }
      if (measurement.torsoTilt > 30) {
        this.addIssue('TORSO_LEAN');
        valid = false;
      }
    }

    this.reps.push({ ...measurement, valid, frontLeg });
  }

  build(): WorkoutAnalysisReport | null {
    if (this.type !== 'squat' && this.type !== 'lunge') return null;
    const totalReps = this.reps.length;
    const validReps = this.reps.filter((rep) => rep.valid).length;
    const leftReps = this.reps.filter((rep) => rep.frontLeg === 'left').length;
    const rightReps = this.reps.filter((rep) => rep.frontLeg === 'right').length;

    if (this.type === 'lunge' && totalReps >= 2 && Math.abs(leftReps - rightReps) > 1) {
      this.issueCounts.set('SIDE_IMBALANCE', 1);
    } else {
      this.issueCounts.delete('SIDE_IMBALANCE');
    }

    const issues = [...this.issueCounts.entries()].map(([type, count]) => ({
      type,
      count,
      message: ISSUE_MESSAGES[type],
    }));
    const deductions: Record<ReportIssueType, number> = {
      SHALLOW_DEPTH: 8,
      TORSO_LEAN: 6,
      KNEE_IMBALANCE: 5,
      FRONT_LEG_UNCLEAR: 6,
      SIDE_IMBALANCE: 10,
    };
    const score = Math.max(
      0,
      100 - issues.reduce((sum, issue) => sum + deductions[issue.type] * issue.count, 0),
    );

    return {
      exerciseType: this.type,
      totalReps,
      validReps,
      score,
      metrics: {
        averageDepthAngle: this.average((rep) =>
          this.type === 'lunge'
            ? Math.min(rep.leftKneeAngle, rep.rightKneeAngle)
            : (rep.leftKneeAngle + rep.rightKneeAngle) / 2,
        ),
        averageTorsoTilt: this.average((rep) => rep.torsoTilt),
        averageKneeDifference: this.average((rep) =>
          Math.abs(rep.leftKneeAngle - rep.rightKneeAngle),
        ),
        ...(this.type === 'lunge' ? { leftReps, rightReps } : {}),
      },
      issues,
      summary:
        totalReps === 0
          ? '완료된 동작이 없어 자세를 평가하지 못했어요.'
          : issues[0]?.message ?? '안정적인 자세로 운동을 완료했어요.',
    };
  }

  private addIssue(type: ReportIssueType) {
    this.issueCounts.set(type, (this.issueCounts.get(type) ?? 0) + 1);
  }

  private average(pick: (rep: StoredRep) => number) {
    if (!this.reps.length) return 0;
    return Math.round(
      (this.reps.reduce((sum, rep) => sum + pick(rep), 0) / this.reps.length) * 10,
    ) / 10;
  }
}
