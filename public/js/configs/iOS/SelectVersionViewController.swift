//
//  SelectVersionViewController.swift
//  IDG
//
//  Created by Minh Minh iOS on 05/04/2021.
//  Copyright © 2021 Minh Nguyễn. All rights reserved.
//

import UIKit
import FinalSDK


class SelectVersionViewController: UIViewController {
    
    @IBOutlet weak var buttonDismiss: UIButton!
    @IBOutlet weak var labelTitle: UILabel!
    @IBOutlet weak var labelDescription: UILabel!
    
    @IBOutlet weak var viewOcrFullNormal: UIView!
    @IBOutlet weak var labelTitleOcrFullNormal: UILabel!
    @IBOutlet weak var labelDescriptionOcrFullNormal: UILabel!
    @IBOutlet weak var labelNoteOcrFullNormal: UILabel!
    
    @IBOutlet weak var viewOcrFullProOval: UIView!
    @IBOutlet weak var labelTitleOcrFullProOval: UILabel!
    @IBOutlet weak var labelDescriptionOcrFullProOval: UILabel!
    @IBOutlet weak var labelNoteOcrFullProOval: UILabel!
    
    @IBOutlet weak var viewScanQRCode: UIView!
    @IBOutlet weak var labelQRCode: UILabel!
    @IBOutlet weak var switchScanQRCode: UISwitch!
    @IBOutlet weak var heightViewScanQRCode: NSLayoutConstraint!
    
    @IBOutlet weak var switchDisableCallAPI: UISwitch!
    
    var isType: TypeDocument!
    var isVietnamese: Bool = true
    
    private var isScanQRCode: Bool = false
    private var isDisableCallAPI: Bool = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        
        
        // button Dismiss
        self.buttonDismiss.addTarget(self, action: #selector(self.dismissSelectVersionViewController), for: .touchUpInside)
        
        // labelTitle
        self.labelTitle.text = "Chọn phiên bản"
        self.labelTitle.textColor = UIColor.white
        self.labelTitle.font = UIFont.systemFont(ofSize: 20.0)
        
        // labelDescription
        self.labelDescription.text = "Chọn phiên bản bạn muốn trải nghiệm"
        self.labelDescription.textColor = UIColor.white
        self.labelDescription.font = UIFont.systemFont(ofSize: 14.0)
        
        
        /* viewOcrFullNormal */
        self.labelTitleOcrFullNormal.text = "Phiên bản tiêu chuẩn"
        self.labelTitleOcrFullNormal.textColor = UIColor.white
        self.labelTitleOcrFullNormal.font = UIFont.systemFont(ofSize: 16.0)
        
        self.labelDescriptionOcrFullNormal.text = "Xác thực một góc độ của khuôn mặt"
        self.labelDescriptionOcrFullNormal.textColor = UIColor.white
        self.labelDescriptionOcrFullNormal.font = UIFont.systemFont(ofSize: 14.0)
        
        self.labelNoteOcrFullNormal.text = "Xác thực mặt trước, mặt sau giấy tờ"
        self.labelNoteOcrFullNormal.textColor = UIColor.white
        self.labelNoteOcrFullNormal.font = UIFont.systemFont(ofSize: 14.0)
        
        /* viewOcrFullPro Oval */
        self.labelTitleOcrFullProOval.text = "Phiên bản nâng cao"
        self.labelTitleOcrFullProOval.textColor = UIColor.white
        self.labelTitleOcrFullProOval.font = UIFont.systemFont(ofSize: 16.0)
        
        self.labelDescriptionOcrFullProOval.text = "Thực hiện xác thực khuôn mặt xa gần "
        self.labelDescriptionOcrFullProOval.textColor = UIColor.white
        self.labelDescriptionOcrFullProOval.font = UIFont.systemFont(ofSize: 14.0)
        
        self.labelNoteOcrFullProOval.text = "Xác thực mặt trước, mặt sau giấy tờ"
        self.labelNoteOcrFullProOval.textColor = UIColor.white
        self.labelNoteOcrFullProOval.font = UIFont.systemFont(ofSize: 14.0)
        
        /* viewQRCode */
        self.labelQRCode.text = "Quét QR Code"
        
        if self.isType != IDCardChipBased {
            self.viewScanQRCode.isHidden = true
            self.labelQRCode.isHidden = true
            self.switchScanQRCode.isHidden = true
            self.isScanQRCode = false
            self.heightViewScanQRCode.constant = 0.0
        } else {
            self.isScanQRCode = true
            self.heightViewScanQRCode.constant = 52.0
        }
        
        let tapGestureFullNormal = UITapGestureRecognizer(target: self, action: #selector(self.openCameraFullNormal))
        self.viewOcrFullNormal.addGestureRecognizer(tapGestureFullNormal)
        self.viewOcrFullNormal.isUserInteractionEnabled = true
        
        let tapGestureFullProOval = UITapGestureRecognizer(target: self, action: #selector(self.openCameraFullProOval))
        self.viewOcrFullProOval.addGestureRecognizer(tapGestureFullProOval)
        self.viewOcrFullProOval.isUserInteractionEnabled = true
        
        self.switchScanQRCode.addTarget(self, action: #selector(self.actionChangeValueSwitchScanQRCode), for: .valueChanged)
        
        self.switchDisableCallAPI.addTarget(self, action: #selector(self.actionChangeValueSwitchDisableCallAPI), for: .valueChanged)
        
        SaveData.shared().sdTokenId = ""
        SaveData.shared().sdTokenKey = ""
        SaveData.shared().sdAuthorization = ""
    }
    
    
    // Called when the view is about to made visible. Default does nothing
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
    // Called when the view has been fully transitioned onto the screen. Default does nothing
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
    }
    
    // Called when the view is dismissed, covered or otherwise hidden. Default does nothing
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
    }
    
    // Called after the view was dismissed, covered or otherwise hidden. Default does nothing
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
    }
    
    // Called just before the view controller's view's layoutSubviews method is invoked. Subclasses can implement as necessary. The default is a nop.
    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
    }
    
    // Called just after the view controller's view's layoutSubviews method is invoked. Subclasses can implement as necessary. The default is a nop.
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
    }
    
    
    private func UIColorFromRGB(rgbValue: UInt, alpha: CGFloat) -> UIColor {
        return UIColor(
            red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
            green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
            blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
            alpha: CGFloat(alpha)
        )
    }
    
    
    @objc private func dismissSelectVersionViewController() {
        self.dismiss(animated: true, completion: nil)
    }
    
    
    @objc private func openCameraFullNormal() {
        
        let objCamera = ICEkycCameraRouter.createModule() as! ICEkycCameraViewController
        
        objCamera.isVersion = Normal
        objCamera.flowType = full
        objCamera.isType = IdentityCard
        objCamera.cameraDelegate = self
        
        objCamera.unitCustomer = ""
        objCamera.resourceCustomer = ""
        objCamera.challengeCode = ""
        
        objCamera.isCompare = true
        objCamera.isShowHelp = true
        objCamera.isShowTrademark = true
        objCamera.isCheckMaskFace = true
        objCamera.isAddFace = false
        objCamera.isCheckLivenessFace = true
        objCamera.languageApplication = "vi"
        objCamera.isSkipVoiceVideo = true
        objCamera.isVersionQRCode = self.isScanQRCode
        
        objCamera.nameHelpVideoFullScreen = "idg_full"
        
        objCamera.styleHeader = 1;
        
        objCamera.colorContentHeader = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.colorContentMain = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.colorBackgroundMain = self.UIColorFromRGB(rgbValue: 0x122F41, alpha: 1.0)
        
        objCamera.colorLine = self.UIColorFromRGB(rgbValue: 0xD9D9D9, alpha: 1.0)
        
        objCamera.colorBackgroundButton = self.UIColorFromRGB(rgbValue: 0x18D696, alpha: 1.0)
        
        objCamera.colorEkycTextButton = self.UIColorFromRGB(rgbValue: 0x142730, alpha: 1.0)
        
        objCamera.colorEkycCaptureBackground = self.UIColorFromRGB(rgbValue: 0x122F41, alpha: 1.0)
        
        objCamera.colorEkycEffect = self.UIColorFromRGB(rgbValue: 0x18D696, alpha: 1.0)
        
        objCamera.colorEkycButtonCapture = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.colorEkycOval = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.isUsingUnderBackground = true
        
        objCamera.colorEkycUnderBackgound = self.UIColorFromRGB(rgbValue: 0x18D696, alpha: 1.0)
        
        objCamera.colorBackgroundPopup = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.colorEkycTextPopup = self.UIColorFromRGB(rgbValue: 0x142730, alpha: 1.0)

        objCamera.imageTrademark = UIImage(named: "logo", in: Bundle.main, compatibleWith: nil)!
        
        objCamera.sizeLogo = CGSize(width: 38, height: 12);
        
        if self.isVietnamese {
            objCamera.languageApplication = "vi"
        } else {
            objCamera.languageApplication = "en"
        }
        
        objCamera.modalPresentationStyle = .fullScreen
        self.present(objCamera, animated: true, completion: nil)
    }
    
    
    @objc private func openCameraFullProOval() {
        let objCamera = ICEkycCameraRouter.createModule() as! ICEkycCameraViewController
        
        objCamera.cameraDelegate = self
        objCamera.isVersion = ProOval
        objCamera.flowType = full
        objCamera.isType = self.isType;
        
        objCamera.isShowHelp = true
        objCamera.isShowResult = false
        objCamera.isValidatePostcode = true
        objCamera.isCompare = true
        objCamera.isAddFace = false
        objCamera.isShowTrademark = true
        objCamera.isCheckLivenessFace = true
        objCamera.isCheckLivenessCard = true
        objCamera.isCheckMaskFace = true
        objCamera.isShowTrademark = true
        objCamera.isSkipVoiceVideo = true
        objCamera.isVersionQRCode = self.isScanQRCode
        objCamera.unitCustomer = "test1"
        objCamera.resourceCustomer = "VNPT"
        objCamera.challengeCode = "INNOVATIONCENTER"
        objCamera.isValidateDocument = false
        
        objCamera.isDisableCallAPI = self.isDisableCallAPI
        
        objCamera.styleHeader = 1;
        
        objCamera.colorContentHeader = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.colorContentMain = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.colorBackgroundMain = self.UIColorFromRGB(rgbValue: 0x122F41, alpha: 1.0)
        
        objCamera.colorLine = self.UIColorFromRGB(rgbValue: 0xD9D9D9, alpha: 1.0)
        
        objCamera.colorBackgroundButton = self.UIColorFromRGB(rgbValue: 0x18D696, alpha: 1.0)
        
        objCamera.colorEkycTextButton = self.UIColorFromRGB(rgbValue: 0x142730, alpha: 1.0)
        
        objCamera.colorEkycCaptureBackground = self.UIColorFromRGB(rgbValue: 0x122F41, alpha: 1.0)
        
        objCamera.colorEkycEffect = self.UIColorFromRGB(rgbValue: 0x18D696, alpha: 1.0)
        
        objCamera.colorEkycButtonCapture = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.colorEkycOval = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.isUsingUnderBackground = true
        
        objCamera.colorEkycUnderBackgound = self.UIColorFromRGB(rgbValue: 0x18D696, alpha: 1.0)
        
        objCamera.colorBackgroundPopup = self.UIColorFromRGB(rgbValue: 0xFFFFFF, alpha: 1.0)
        
        objCamera.colorEkycTextPopup = self.UIColorFromRGB(rgbValue: 0x142730, alpha: 1.0)

        objCamera.imageTrademark = UIImage(named: "logo", in: Bundle.main, compatibleWith: nil)!
        
        objCamera.sizeLogo = CGSize(width: 38, height: 12);
                
        if self.isVietnamese {
            objCamera.languageApplication = "vi"
        } else {
            objCamera.languageApplication = "en"
        }
        
        objCamera.modalPresentationStyle = .fullScreen
        objCamera.modalTransitionStyle = .coverVertical
        self.present(objCamera, animated: true, completion: nil)
    }
    
    @objc private func actionChangeValueSwitchScanQRCode(switchScanQRCode: UISwitch) {
        self.isScanQRCode = switchScanQRCode.isOn
    }
    
    @objc private func actionChangeValueSwitchDisableCallAPI(switchDisableCallAPI: UISwitch) {
        self.isDisableCallAPI = switchDisableCallAPI.isOn
        print("self.isDisableCallAPI = \(self.isDisableCallAPI)")
    }
}


extension SelectVersionViewController: ICEkycCameraDelegate {
    
    func closeSDK(_ type:ScreenType) {
        print("Close SDK");
    }
    
    func getResult() {
        print("Json = \(SaveData.shared().jsonInfo)")
    }
}
